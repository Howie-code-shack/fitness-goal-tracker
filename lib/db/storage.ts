import type { Goal, Activity } from '@/lib/validations/goal';

const GOALS_KEY = 'fitness-goals';
const ACTIVITIES_KEY = 'fitness-activities';

export const storage = {
  // Goals
  getGoals: (): Goal[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setGoals: (goals: Goal[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  },

  // Activities
  getActivities: (): Activity[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setActivities: (activities: Activity[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
  },
};
