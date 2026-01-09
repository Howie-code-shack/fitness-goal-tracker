export interface StravaTokenResponse {
  token_type: 'Bearer';
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  type: string; // 'Run', 'Ride', 'Swim', etc.
  sport_type: string;
  start_date: string; // ISO 8601
  start_date_local: string;
  timezone: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
  };
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export type ActivityType = 'Run' | 'Ride' | 'Swim' | 'VirtualRide' | 'VirtualRun';

export const ACTIVITY_TYPE_MAPPING: Record<string, 'running' | 'cycling' | 'swimming' | null> = {
  Run: 'running',
  VirtualRun: 'running',
  TrailRun: 'running',
  Ride: 'cycling',
  VirtualRide: 'cycling',
  MountainBikeRide: 'cycling',
  GravelRide: 'cycling',
  EBikeRide: 'cycling',
  Swim: 'swimming',
  OpenWaterSwim: 'swimming',
};
