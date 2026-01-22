import type { StravaTokens, StravaAthlete } from '@/types/strava';

const STRAVA_TOKENS_KEY = 'strava-tokens';
const STRAVA_ATHLETE_KEY = 'strava-athlete';

export const storage = {
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
  getStravaAthlete: (): StravaAthlete | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STRAVA_ATHLETE_KEY);
    return data ? JSON.parse(data) : null;
  },

  setStravaAthlete: (athlete: StravaAthlete): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STRAVA_ATHLETE_KEY, JSON.stringify(athlete));
  },

  // Clear all Strava data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STRAVA_TOKENS_KEY);
    localStorage.removeItem(STRAVA_ATHLETE_KEY);
  },
};
