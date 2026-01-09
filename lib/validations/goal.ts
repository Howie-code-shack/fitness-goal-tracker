import { z } from 'zod';

export const goalTypeSchema = z.enum(['running', 'cycling', 'swimming']);

export const createGoalSchema = z.object({
  type: goalTypeSchema,
  yearlyTarget: z.number().positive().min(1, 'Target must be at least 1 km'),
  year: z.number().int().min(2020).max(2100),
});

export const goalSchema = z.object({
  id: z.string(),
  type: goalTypeSchema,
  yearlyTarget: z.number().positive(),
  currentProgress: z.number().nonnegative().default(0),
  year: z.number().int(),
});

export const activitySchema = z.object({
  id: z.string(),
  goalType: goalTypeSchema,
  distance: z.number().positive().min(0.1, 'Distance must be at least 0.1 km'),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export const createActivitySchema = z.object({
  goalType: goalTypeSchema,
  distance: z.number().positive().min(0.1, 'Distance must be at least 0.1 km'),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateGoalsSchema = z.object({
  running: z.number().positive().min(1),
  cycling: z.number().positive().min(1),
  swimming: z.number().positive().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type Activity = z.infer<typeof activitySchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsSchema>;
