import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { StravaClient, getValidAccessToken } from '@/lib/api/strava-client';
import { ACTIVITY_TYPE_MAPPING } from '@/types/strava';
import { prisma } from '@/lib/db/prisma';
import type { StravaTokens } from '@/types/strava';

export const stravaRouter = router({
  // Get authorization URL
  getAuthUrl: protectedProcedure.query(() => {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`;
    return {
      url: StravaClient.getAuthorizationUrl(redirectUri),
    };
  }),

  // Exchange code for tokens (called from callback page)
  exchangeToken: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tokenResponse = await StravaClient.exchangeToken(input.code);

      const tokens: StravaTokens = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_at,
      };

      // Store tokens in database
      await prisma.stravaToken.upsert({
        where: { userId: ctx.userId },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          athleteId: String(tokenResponse.athlete.id),
        },
        create: {
          userId: ctx.userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          athleteId: String(tokenResponse.athlete.id),
        },
      });

      return {
        tokens,
        athlete: tokenResponse.athlete,
      };
    }),

  // Check if user is connected to Strava
  isConnected: protectedProcedure.query(async ({ ctx }) => {
    const stravaToken = await prisma.stravaToken.findUnique({
      where: { userId: ctx.userId },
    });

    return stravaToken !== null;
  }),

  // Disconnect from Strava
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.stravaToken.deleteMany({
      where: { userId: ctx.userId },
    });

    return { success: true };
  }),

  // Sync activities from Strava
  syncActivities: protectedProcedure
    .input(
      z.object({
        after: z.number().optional(), // Unix timestamp - fetch activities after this date
        before: z.number().optional(), // Unix timestamp - fetch activities before this date
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stravaToken = await prisma.stravaToken.findUnique({
        where: { userId: ctx.userId },
      });

      if (!stravaToken) {
        throw new Error('Not connected to Strava');
      }

      const tokens: StravaTokens = {
        accessToken: stravaToken.accessToken,
        refreshToken: stravaToken.refreshToken,
        expiresAt: stravaToken.expiresAt,
      };

      // Get valid access token (refresh if needed)
      const accessToken = await getValidAccessToken(tokens);

      // Update stored tokens if refreshed
      if (accessToken !== tokens.accessToken) {
        const refreshed = await StravaClient.refreshToken(tokens.refreshToken);
        await prisma.stravaToken.update({
          where: { userId: ctx.userId },
          data: {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: refreshed.expires_at,
          },
        });
      }

      const client = new StravaClient(accessToken);

      // Fetch activities (default: last 200 activities)
      const activities = await client.getActivities({
        per_page: 200,
        after: input.after,
        before: input.before,
      });

      // Map Strava activities to our format
      const mappedActivities = activities
        .map((activity) => {
          const goalType = ACTIVITY_TYPE_MAPPING[activity.type] || ACTIVITY_TYPE_MAPPING[activity.sport_type];

          if (!goalType) {
            return null; // Skip activities we don't track
          }

          // Swimming is stored in meters, running/cycling in km
          const distance = goalType === 'swimming'
            ? activity.distance // Keep meters for swimming
            : activity.distance / 1000; // Convert meters to km for running/cycling

          return {
            id: `strava-${activity.id}`,
            goalType,
            distance,
            date: activity.start_date,
            notes: activity.name,
            source: 'strava',
            stravaId: activity.id,
          };
        })
        .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

      return {
        count: mappedActivities.length,
        activities: mappedActivities,
      };
    }),

  // Get athlete info
  getAthlete: protectedProcedure.query(async ({ ctx }) => {
    const stravaToken = await prisma.stravaToken.findUnique({
      where: { userId: ctx.userId },
    });

    if (!stravaToken) {
      throw new Error('Not connected to Strava');
    }

    const tokens: StravaTokens = {
      accessToken: stravaToken.accessToken,
      refreshToken: stravaToken.refreshToken,
      expiresAt: stravaToken.expiresAt,
    };

    const accessToken = await getValidAccessToken(tokens);
    const client = new StravaClient(accessToken);

    return client.getAthlete();
  }),
});
