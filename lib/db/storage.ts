import type { Goal, Activity } from '@/lib/validations/goal';
import type { StravaTokens } from '@/types/strava';

const GOALS_KEY = 'fitness-goals';
const ACTIVITIES_KEY = 'fitness-activities';
const STRAVA_TOKENS_KEY = 'strava-tokens';
const STRAVA_ATHLETE_KEY = 'strava-athlete';

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

  // Strava Tokens
  getStravaTokens: (): StravaTokens | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STRAVA_TOKENS_KEY);
    return data ? JSON.parse(data) : null;
  },

  setStravaTokens: (tokens: StravaTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STRAVA_TOKENS_KEY, JSON.stringify(tokens));
  },

  clearStravaTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STRAVA_TOKENS_KEY);
    localStorage.removeItem(STRAVA_ATHLETE_KEY);
  },

  // Strava Athlete
  getStravaAthlete: (): any | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STRAVA_ATHLETE_KEY);
    return data ? JSON.parse(data) : null;
  },

  setStravaAthlete: (athlete: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STRAVA_ATHLETE_KEY, JSON.stringify(athlete));
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(STRAVA_TOKENS_KEY);
    localStorage.removeItem(STRAVA_ATHLETE_KEY);
  },
};
