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
  distance: z.number().positive().min(0.1, 'Distance must be at least 0.1'),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

// Unit convention: swimming in meters, running/cycling in km
export const createActivitySchema = z.object({
  goalType: goalTypeSchema,
  distance: z.number().positive(),
  date: z.string().datetime(),
  notes: z.string().optional(),
}).refine((data) => {
  // Swimming: minimum 10 meters (0.01 km equivalent)
  if (data.goalType === 'swimming') {
    return data.distance >= 10;
  }
  // Running/Cycling: minimum 0.1 km
  return data.distance >= 0.1;
}, {
  message: 'Distance too small: swimming minimum 10m, running/cycling minimum 0.1km',
  path: ['distance'],
});

// Unit convention: swimming targets in meters, running/cycling in km
export const updateGoalsSchema = z.object({
  running: z.number().positive().min(1, 'Running target must be at least 1 km').max(10000, 'Running target cannot exceed 10,000 km'),
  cycling: z.number().positive().min(1, 'Cycling target must be at least 1 km').max(50000, 'Cycling target cannot exceed 50,000 km'),
  swimming: z.number().positive().min(100, 'Swimming target must be at least 100 meters').max(1000000, 'Swimming target cannot exceed 1,000,000 meters'),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type Activity = z.infer<typeof activitySchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsSchema>;
