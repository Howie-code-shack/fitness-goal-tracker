import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { updateGoalsSchema, createActivitySchema, goalTypeSchema } from '@/lib/validations/goal';
import { prisma } from '@/lib/db/prisma';

// Helper to calculate progress stats for a goal
function calculateProgressStats(goal: { target: number; type: string }, currentProgress: number) {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);
  const now = new Date();
  const daysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = (goal.target * daysPassed) / daysInYear;

  const distanceAheadBehind = currentProgress - expectedProgress;
  const percentBehind = goal.target > 0
    ? (distanceAheadBehind / goal.target) * 100
    : 0;

  return {
    goalType: goal.type,
    distanceRemaining: Math.max(0, goal.target - currentProgress),
    distanceCompleted: currentProgress,
    distanceAheadBehind,
    percentComplete: (currentProgress / goal.target) * 100,
    expectedProgress,
    percentBehind,
  };
}

export const goalsRouter = router({
  // Get all goals for current year
  getGoals: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const goals = await prisma.goal.findMany({
      where: {
        userId: ctx.userId,
        year: currentYear,
      },
    });

    // Get current progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear + 1, 0, 1);

        const result = await prisma.activity.aggregate({
          where: {
            userId: ctx.userId,
            goalType: goal.type,
            date: {
              gte: yearStart,
              lt: yearEnd,
            },
          },
          _sum: {
            distance: true,
          },
        });

        return {
          id: goal.id,
          type: goal.type,
          yearlyTarget: goal.target,
          currentProgress: result._sum.distance || 0,
          year: goal.year,
        };
      })
    );

    return goalsWithProgress;
  }),

  // Initialize or update goals for the year
  updateGoals: protectedProcedure
    .input(updateGoalsSchema)
    .mutation(async ({ ctx, input }) => {
      const currentYear = new Date().getFullYear();
      const goalTypes = [
        { type: 'running', target: input.running },
        { type: 'cycling', target: input.cycling },
        { type: 'swimming', target: input.swimming },
      ];

      const results = await Promise.all(
        goalTypes.map(async ({ type, target }) => {
          return prisma.goal.upsert({
            where: {
              userId_type_year: {
                userId: ctx.userId,
                type,
                year: currentYear,
              },
            },
            update: { target },
            create: {
              userId: ctx.userId,
              type,
              target,
              year: currentYear,
            },
          });
        })
      );

      return results.map((goal) => ({
        id: goal.id,
        type: goal.type,
        yearlyTarget: goal.target,
        currentProgress: 0,
        year: goal.year,
      }));
    }),

  // Add an activity
  addActivity: protectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const activity = await prisma.activity.create({
        data: {
          userId: ctx.userId,
          goalType: input.goalType,
          distance: input.distance,
          date: new Date(input.date),
          notes: input.notes,
        },
      });

      return {
        id: activity.id,
        goalType: activity.goalType,
        distance: activity.distance,
        date: activity.date.toISOString(),
        notes: activity.notes,
      };
    }),

  // Get activities for a specific goal type
  getActivities: protectedProcedure
    .input(z.object({ goalType: goalTypeSchema }))
    .query(async ({ ctx, input }) => {
      const activities = await prisma.activity.findMany({
        where: {
          userId: ctx.userId,
          goalType: input.goalType,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return activities.map((a) => ({
        id: a.id,
        goalType: a.goalType,
        distance: a.distance,
        date: a.date.toISOString(),
        notes: a.notes,
      }));
    }),

  // Get progress stats for a goal
  getProgressStats: protectedProcedure
    .input(z.object({ goalType: goalTypeSchema }))
    .query(async ({ ctx, input }) => {
      const currentYear = new Date().getFullYear();

      const goal = await prisma.goal.findUnique({
        where: {
          userId_type_year: {
            userId: ctx.userId,
            type: input.goalType,
            year: currentYear,
          },
        },
      });

      if (!goal) {
        return null;
      }

      // Calculate current progress
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear + 1, 0, 1);

      const result = await prisma.activity.aggregate({
        where: {
          userId: ctx.userId,
          goalType: input.goalType,
          date: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        _sum: {
          distance: true,
        },
      });

      const currentProgress = result._sum.distance || 0;

      return calculateProgressStats(goal, currentProgress);
    }),

  // Get progress stats for all goals to determine most urgent
  getAllProgressStats: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const goals = await prisma.goal.findMany({
      where: {
        userId: ctx.userId,
        year: currentYear,
      },
    });

    if (goals.length === 0) {
      return { stats: [], mostUrgent: null };
    }

    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const stats = await Promise.all(
      goals.map(async (goal) => {
        const result = await prisma.activity.aggregate({
          where: {
            userId: ctx.userId,
            goalType: goal.type,
            date: {
              gte: yearStart,
              lt: yearEnd,
            },
          },
          _sum: {
            distance: true,
          },
        });

        const currentProgress = result._sum.distance || 0;
        return calculateProgressStats(goal, currentProgress);
      })
    );

    // Find the most urgent activity (most negative percentBehind)
    const mostUrgent = stats.reduce((worst, current) => {
      if (current.percentBehind < worst.percentBehind) {
        return current;
      }
      return worst;
    }, stats[0]);

    // Only flag as urgent if actually behind schedule
    const urgentGoalType = mostUrgent.percentBehind < 0 ? mostUrgent.goalType : null;

    return { stats, mostUrgent: urgentGoalType };
  }),

  // Check if goals are set up
  hasGoals: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const count = await prisma.goal.count({
      where: {
        userId: ctx.userId,
        year: currentYear,
      },
    });

    return count > 0;
  }),

  // Import activities from external source (e.g., Strava)
  importActivities: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          goalType: goalTypeSchema,
          distance: z.number(),
          date: z.string(),
          notes: z.string().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert activities (use stravaId for deduplication)
      const results = await Promise.all(
        input.map(async (activity) => {
          const stravaId = activity.id.startsWith('strava-')
            ? activity.id.replace('strava-', '')
            : null;

          if (stravaId) {
            // Upsert by stravaId for Strava activities
            return prisma.activity.upsert({
              where: { stravaId },
              update: {
                distance: activity.distance,
                date: new Date(activity.date),
                notes: activity.notes,
              },
              create: {
                userId: ctx.userId,
                goalType: activity.goalType,
                distance: activity.distance,
                date: new Date(activity.date),
                notes: activity.notes,
                stravaId,
              },
            });
          } else {
            // Create new activity for non-Strava sources
            return prisma.activity.create({
              data: {
                userId: ctx.userId,
                goalType: activity.goalType,
                distance: activity.distance,
                date: new Date(activity.date),
                notes: activity.notes,
              },
            });
          }
        })
      );

      const totalCount = await prisma.activity.count({
        where: { userId: ctx.userId },
      });

      return {
        imported: results.length,
        totalActivities: totalCount,
      };
    }),
});
