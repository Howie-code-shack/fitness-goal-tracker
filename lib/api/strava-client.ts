import type { StravaActivity, StravaTokenResponse, StravaTokens } from '@/types/strava';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth';

export class StravaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeToken(code: string): Promise<StravaTokenResponse> {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange token: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  static async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get authenticated athlete's activities
   */
  async getActivities(params?: {
    before?: number; // Unix timestamp
    after?: number; // Unix timestamp
    page?: number;
    per_page?: number;
  }): Promise<StravaActivity[]> {
    const queryParams = new URLSearchParams();
    if (params?.before) queryParams.append('before', params.before.toString());
    if (params?.after) queryParams.append('after', params.after.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch activities: ${error}`);
    }

    return response.json();
  }

  /**
   * Get a specific activity by ID
   */
  async getActivity(id: number): Promise<StravaActivity> {
    const response = await fetch(`${STRAVA_API_BASE}/activities/${id}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch activity: ${error}`);
    }

    return response.json();
  }

  /**
   * Get authenticated athlete profile
   */
  async getAthlete() {
    const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch athlete: ${error}`);
    }

    return response.json();
  }

  /**
   * Generate Strava OAuth authorization URL
   */
  static getAuthorizationUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read,activity:read_all',
      approval_prompt: 'auto',
    });

    return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`;
  }
}

/**
 * Helper to check if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() / 1000 >= expiresAt;
}

/**
 * Helper to get valid access token (refresh if needed)
 */
export async function getValidAccessToken(tokens: StravaTokens): Promise<string> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens.accessToken;
  }

  const refreshed = await StravaClient.refreshToken(tokens.refreshToken);
  return refreshed.access_token;
}
