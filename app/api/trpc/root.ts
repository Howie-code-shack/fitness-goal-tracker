import { router } from './trpc';
import { goalsRouter } from './routers/goals';
import { stravaRouter } from './routers/strava';

export const appRouter = router({
  goals: goalsRouter,
  strava: stravaRouter,
});

export type AppRouter = typeof appRouter;
