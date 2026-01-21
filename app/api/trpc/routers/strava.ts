import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { StravaClient, getValidAccessToken } from '@/lib/api/strava-client';
import { ACTIVITY_TYPE_MAPPING } from '@/types/strava';
import { prisma } from '@/lib/db/prisma';
import type { StravaTokens } from '@/types/strava';

// Temporary default user ID until authentication is implemented
const DEFAULT_USER_ID = 'default-user';

// Helper to ensure default user exists
async function ensureDefaultUser() {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        email: 'default@example.com',
        name: 'Default User',
      },
    });
  }
}

export const stravaRouter = router({
  // Get authorization URL
  getAuthUrl: publicProcedure.query(() => {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`;
    return {
      url: StravaClient.getAuthorizationUrl(redirectUri),
    };
  }),

  // Exchange code for tokens (called from callback page)
  exchangeToken: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      await ensureDefaultUser();

      const tokenResponse = await StravaClient.exchangeToken(input.code);

      const tokens: StravaTokens = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_at,
      };

      // Store tokens in database
      await prisma.stravaToken.upsert({
        where: { userId: DEFAULT_USER_ID },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          athleteId: String(tokenResponse.athlete.id),
        },
        create: {
          userId: DEFAULT_USER_ID,
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
  isConnected: publicProcedure.query(async () => {
    const stravaToken = await prisma.stravaToken.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    return stravaToken !== null;
  }),

  // Disconnect from Strava
  disconnect: publicProcedure.mutation(async () => {
    await prisma.stravaToken.deleteMany({
      where: { userId: DEFAULT_USER_ID },
    });

    return { success: true };
  }),

  // Sync activities from Strava
  syncActivities: publicProcedure
    .input(
      z.object({
        after: z.number().optional(), // Unix timestamp - fetch activities after this date
        before: z.number().optional(), // Unix timestamp - fetch activities before this date
      })
    )
    .mutation(async ({ input }) => {
      const stravaToken = await prisma.stravaToken.findUnique({
        where: { userId: DEFAULT_USER_ID },
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
          where: { userId: DEFAULT_USER_ID },
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
  getAthlete: publicProcedure.query(async () => {
    const stravaToken = await prisma.stravaToken.findUnique({
      where: { userId: DEFAULT_USER_ID },
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
