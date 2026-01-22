import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { StravaClient, getValidAccessToken } from '@/lib/api/strava-client';
import { ACTIVITY_TYPE_MAPPING } from '@/types/strava';
import { prisma } from '@/lib/db/prisma';
import { config } from '@/lib/config';
import type { StravaTokens } from '@/types/strava';

export const stravaRouter = router({
  // Get authorization URL
  getAuthUrl: protectedProcedure.query(() => {
    const redirectUri = `${config.app.url}/api/strava/callback`;
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
      let accessToken: string;
      try {
        accessToken = await getValidAccessToken(tokens);

        // Update stored tokens if refreshed
        if (accessToken !== tokens.accessToken) {
          const refreshed = await StravaClient.refreshToken(tokens.refreshToken);

          if (!refreshed.access_token || !refreshed.refresh_token) {
            throw new Error('Invalid token response from Strava');
          }

          await prisma.stravaToken.update({
            where: { userId: ctx.userId },
            data: {
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token,
              expiresAt: refreshed.expires_at,
            },
          });
        }
      } catch (error) {
        // Force re-authentication by deleting tokens
        await prisma.stravaToken.deleteMany({ where: { userId: ctx.userId } });
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Strava token refresh failed. Please reconnect your Strava account.',
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
          };
        })
        .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

      return {
        count: mappedActivities.length,
        activities: mappedActivities,
      };
    }),

  // Sync and import activities atomically
  syncAndImportActivities: protectedProcedure
    .input(
      z.object({
        after: z.number().optional(),
        before: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stravaToken = await prisma.stravaToken.findUnique({
        where: { userId: ctx.userId },
      });

      if (!stravaToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not connected to Strava',
        });
      }

      const tokens: StravaTokens = {
        accessToken: stravaToken.accessToken,
        refreshToken: stravaToken.refreshToken,
        expiresAt: stravaToken.expiresAt,
      };

      // Get valid access token (refresh if needed)
      let accessToken: string;
      try {
        accessToken = await getValidAccessToken(tokens);

        // Update stored tokens if refreshed
        if (accessToken !== tokens.accessToken) {
          const refreshed = await StravaClient.refreshToken(tokens.refreshToken);

          if (!refreshed.access_token || !refreshed.refresh_token) {
            throw new Error('Invalid token response from Strava');
          }

          await prisma.stravaToken.update({
            where: { userId: ctx.userId },
            data: {
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token,
              expiresAt: refreshed.expires_at,
            },
          });
        }
      } catch (error) {
        // Force re-authentication by deleting tokens
        await prisma.stravaToken.deleteMany({ where: { userId: ctx.userId } });
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Strava token refresh failed. Please reconnect your Strava account.',
        });
      }

      const client = new StravaClient(accessToken);

      // Fetch activities
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
            return null;
          }

          const distance = goalType === 'swimming'
            ? activity.distance
            : activity.distance / 1000;

          return {
            id: `strava-${activity.id}`,
            goalType,
            distance,
            date: activity.start_date,
            notes: activity.name,
          };
        })
        .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

      // Import activities directly (if any)
      if (mappedActivities.length === 0) {
        return {
          synced: 0,
          imported: 0,
          totalActivities: await prisma.activity.count({ where: { userId: ctx.userId } }),
        };
      }

      // Use transaction to import activities atomically
      const result = await prisma.$transaction(async (tx) => {
        const imported = [];
        const errors = [];

        for (const activity of mappedActivities) {
          const stravaId = activity.id.startsWith('strava-')
            ? activity.id.replace('strava-', '')
            : null;

          try {
            if (stravaId) {
              const result = await tx.activity.upsert({
                where: { stravaId },
                update: {
                  distance: activity.distance,
                  date: new Date(activity.date),
                  notes: activity.notes || null,
                },
                create: {
                  userId: ctx.userId,
                  goalType: activity.goalType,
                  distance: activity.distance,
                  date: new Date(activity.date),
                  notes: activity.notes || null,
                  stravaId,
                },
              });
              imported.push(result);
            }
          } catch (activityError: unknown) {
            const errorMessage = activityError instanceof Error
              ? activityError.message
              : String(activityError);
            console.error(`Failed to import activity ${activity.id}:`, errorMessage);
            errors.push({ activity: activity.id, error: errorMessage });
          }
        }

        const totalCount = await tx.activity.count({ where: { userId: ctx.userId } });

        return { imported: imported.length, totalCount, errors };
      });

      return {
        synced: mappedActivities.length,
        imported: result.imported,
        totalActivities: result.totalCount,
        errors: result.errors.length > 0 ? result.errors : undefined,
      };
    }),

  // Get athlete info
  getAthlete: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stravaToken = await prisma.stravaToken.findUnique({
        where: { userId: ctx.userId },
      });

      if (!stravaToken) {
        return null;
      }

      const tokens: StravaTokens = {
        accessToken: stravaToken.accessToken,
        refreshToken: stravaToken.refreshToken,
        expiresAt: stravaToken.expiresAt,
      };

      let accessToken: string;
      try {
        accessToken = await getValidAccessToken(tokens);

        // Update tokens in DB if they were refreshed
        if (accessToken !== tokens.accessToken) {
          const refreshed = await StravaClient.refreshToken(tokens.refreshToken);

          if (!refreshed.access_token || !refreshed.refresh_token) {
            throw new Error('Invalid token response from Strava');
          }

          await prisma.stravaToken.update({
            where: { userId: ctx.userId },
            data: {
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token,
              expiresAt: refreshed.expires_at,
            },
          });
        }
      } catch (tokenError) {
        // Force re-authentication by deleting tokens
        await prisma.stravaToken.deleteMany({ where: { userId: ctx.userId } });
        console.error(`[getAthlete] Token refresh failed:`, tokenError);
        return null;
      }

      const client = new StravaClient(accessToken);
      return client.getAthlete();
    } catch (error) {
      console.error(`[getAthlete] Error:`, error);
      // Return null instead of throwing - athlete info is optional
      return null;
    }
  }),
});
