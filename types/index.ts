export type GoalType = 'running' | 'cycling' | 'swimming';

export interface Goal {
  id: string;
  type: GoalType;
  yearlyTarget: number; // in km
  currentProgress: number; // in km
  year: number;
}

export interface Activity {
  id: string;
  goalType: GoalType;
  distance: number; // in km
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
