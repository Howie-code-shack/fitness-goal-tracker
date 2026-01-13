import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { updateGoalsSchema, createActivitySchema, goalTypeSchema } from '@/lib/validations/goal';
import type { Goal, Activity } from '@/lib/validations/goal';

// In-memory storage (will be replaced by proper database later)
let goals: Goal[] = [];
let activities: Activity[] = [];

// Helper function to recalculate goal progress from activities
function recalculateProgress() {
  const currentYear = new Date().getFullYear();

  // Reset all progress for current year
  goals.forEach((goal) => {
    if (goal.year === currentYear) {
      goal.currentProgress = 0;
    }
  });

  // Sum up activities by goal type for current year
  activities.forEach((activity) => {
    const activityDate = new Date(activity.date);
    if (activityDate.getFullYear() === currentYear) {
      const goal = goals.find((g) => g.type === activity.goalType && g.year === currentYear);
      if (goal) {
        goal.currentProgress += activity.distance;
      }
    }
  });
}

export const goalsRouter = router({
  // Get all goals for current year
  getGoals: publicProcedure.query(() => {
    const currentYear = new Date().getFullYear();
    return goals.filter(g => g.year === currentYear);
  }),

  // Initialize or update goals for the year
  updateGoals: publicProcedure
    .input(updateGoalsSchema)
    .mutation(({ input }) => {
      const currentYear = new Date().getFullYear();

      // Remove existing goals for current year
      goals = goals.filter(g => g.year !== currentYear);

      // Create new goals
      const newGoals: Goal[] = [
        {
          id: `running-${currentYear}`,
          type: 'running',
          yearlyTarget: input.running,
          currentProgress: 0,
          year: currentYear,
        },
        {
          id: `cycling-${currentYear}`,
          type: 'cycling',
          yearlyTarget: input.cycling,
          currentProgress: 0,
          year: currentYear,
        },
        {
          id: `swimming-${currentYear}`,
          type: 'swimming',
          yearlyTarget: input.swimming,
          currentProgress: 0,
          year: currentYear,
        },
      ];

      goals.push(...newGoals);
      return newGoals;
    }),

  // Add an activity
  addActivity: publicProcedure
    .input(createActivitySchema)
    .mutation(({ input }) => {
      const activity: Activity = {
        id: `activity-${Date.now()}`,
        ...input,
      };

      activities.push(activity);

      // Update goal progress
      const currentYear = new Date().getFullYear();
      const goal = goals.find(g => g.type === input.goalType && g.year === currentYear);
      if (goal) {
        goal.currentProgress += input.distance;
      }

      return activity;
    }),

  // Get activities for a specific goal type
  getActivities: publicProcedure
    .input(z.object({ goalType: goalTypeSchema }))
    .query(({ input }) => {
      return activities
        .filter(a => a.goalType === input.goalType)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }),

  // Get progress stats for a goal
  getProgressStats: publicProcedure
    .input(z.object({ goalType: goalTypeSchema }))
    .query(({ input }) => {
      const currentYear = new Date().getFullYear();
      const goal = goals.find(g => g.type === input.goalType && g.year === currentYear);

      if (!goal) {
        return null;
      }

      // Calculate expected progress based on current date
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);
      const now = new Date();
      const daysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = (goal.yearlyTarget * daysPassed) / daysInYear;

      const distanceAheadBehind = goal.currentProgress - expectedProgress;

      // Calculate percentage behind relative to yearly target
      // Negative means behind, positive means ahead
      const percentBehind = goal.yearlyTarget > 0
        ? (distanceAheadBehind / goal.yearlyTarget) * 100
        : 0;

      return {
        distanceRemaining: Math.max(0, goal.yearlyTarget - goal.currentProgress),
        distanceCompleted: goal.currentProgress,
        distanceAheadBehind,
        percentComplete: (goal.currentProgress / goal.yearlyTarget) * 100,
        expectedProgress,
        percentBehind, // Negative = behind schedule, positive = ahead
      };
    }),

  // Get progress stats for all goals to determine most urgent
  getAllProgressStats: publicProcedure.query(() => {
    const currentYear = new Date().getFullYear();
    const currentYearGoals = goals.filter(g => g.year === currentYear);

    if (currentYearGoals.length === 0) {
      return { stats: [], mostUrgent: null };
    }

    // Calculate expected progress based on current date
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    const now = new Date();
    const daysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));

    const stats = currentYearGoals.map(goal => {
      const expectedProgress = (goal.yearlyTarget * daysPassed) / daysInYear;
      const distanceAheadBehind = goal.currentProgress - expectedProgress;
      const percentBehind = goal.yearlyTarget > 0
        ? (distanceAheadBehind / goal.yearlyTarget) * 100
        : 0;

      return {
        goalType: goal.type,
        distanceRemaining: Math.max(0, goal.yearlyTarget - goal.currentProgress),
        distanceCompleted: goal.currentProgress,
        distanceAheadBehind,
        percentComplete: (goal.currentProgress / goal.yearlyTarget) * 100,
        expectedProgress,
        percentBehind,
      };
    });

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
  hasGoals: publicProcedure.query(() => {
    const currentYear = new Date().getFullYear();
    return goals.some(g => g.year === currentYear);
  }),

  // Import activities from external source (e.g., Strava)
  importActivities: publicProcedure
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
    .mutation(({ input }) => {
      // Remove any existing activities with the same IDs (to avoid duplicates)
      const newActivityIds = new Set(input.map((a) => a.id));
      activities = activities.filter((a) => !newActivityIds.has(a.id));

      // Add new activities
      activities.push(...input);

      // Recalculate all goal progress
      recalculateProgress();

      return {
        imported: input.length,
        totalActivities: activities.length,
      };
    }),
});
