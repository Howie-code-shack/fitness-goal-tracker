import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { StravaClient, getValidAccessToken } from '@/lib/api/strava-client';
import { ACTIVITY_TYPE_MAPPING } from '@/types/strava';
import type { StravaTokens } from '@/types/strava';

// Server-side token storage (in production, use a database)
const tokenStore = new Map<string, StravaTokens>();

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
      const tokenResponse = await StravaClient.exchangeToken(input.code);

      const tokens: StravaTokens = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_at,
      };

      // Store tokens (in production, associate with user ID)
      tokenStore.set('default', tokens);

      return {
        tokens,
        athlete: tokenResponse.athlete,
      };
    }),

  // Check if user is connected to Strava
  isConnected: publicProcedure.query(() => {
    return tokenStore.has('default');
  }),

  // Disconnect from Strava
  disconnect: publicProcedure.mutation(() => {
    tokenStore.delete('default');
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
      const tokens = tokenStore.get('default');
      if (!tokens) {
        throw new Error('Not connected to Strava');
      }

      // Get valid access token (refresh if needed)
      const accessToken = await getValidAccessToken(tokens);

      // Update stored tokens if refreshed
      if (accessToken !== tokens.accessToken) {
        const refreshed = await StravaClient.refreshToken(tokens.refreshToken);
        const newTokens: StravaTokens = {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: refreshed.expires_at,
        };
        tokenStore.set('default', newTokens);
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

          return {
            id: `strava-${activity.id}`,
            goalType,
            distance: activity.distance / 1000, // Convert meters to km
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
    const tokens = tokenStore.get('default');
    if (!tokens) {
      throw new Error('Not connected to Strava');
    }

    const accessToken = await getValidAccessToken(tokens);
    const client = new StravaClient(accessToken);

    return client.getAthlete();
  }),
});
