export type GoalType = 'running' | 'cycling' | 'swimming';

export interface Goal {
  id: string;
  type: GoalType;
  yearlyTarget: number; // meters for swimming, km for running/cycling
  currentProgress: number; // meters for swimming, km for running/cycling
  year: number;
}

export interface Activity {
  id: string;
  goalType: GoalType;
  distance: number; // meters for swimming, km for running/cycling
  date: string; // ISO string
  notes?: string;
}

export interface ProgressStats {
  distanceRemaining: number;
  distanceCompleted: number;
  distanceAheadBehind: number;
  percentComplete: number;
  expectedProgress: number;
}
