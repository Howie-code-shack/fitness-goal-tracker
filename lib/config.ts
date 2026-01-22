/**
 * Environment configuration with validation
 *
 * This file validates all required environment variables on application startup
 * to catch configuration issues early rather than at runtime.
 */

interface Config {
  auth: {
    secret: string;
    googleClientId: string;
    googleClientSecret: string;
  };
  strava: {
    clientId: string;
    clientSecret: string;
    appUrl: string;
  };
  app: {
    url: string;
  };
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file and ensure ${key} is set.`
    );
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Validates and exports application configuration
 * Note: Database config (POSTGRES_URL) is managed by Prisma schema, not validated here
 */
export const config: Config = {
  auth: {
    secret: getRequiredEnv('AUTH_SECRET'),
    googleClientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
  },
  strava: {
    clientId: getRequiredEnv('NEXT_PUBLIC_STRAVA_CLIENT_ID'),
    clientSecret: getRequiredEnv('STRAVA_CLIENT_SECRET'),
    appUrl: getRequiredEnv('NEXT_PUBLIC_APP_URL'),
  },
  app: {
    url: getRequiredEnv('NEXT_PUBLIC_APP_URL'),
  },
};

/**
 * Validates configuration on module import
 * Throws an error if any required environment variables are missing
 */
export function validateConfig(): void {
  try {
    // Access config properties to trigger validation
    const requiredValues = [
      config.auth.secret,
      config.auth.googleClientId,
      config.auth.googleClientSecret,
      config.strava.clientId,
      config.strava.clientSecret,
      config.strava.appUrl,
      config.app.url,
    ];

    // Check that none are empty strings
    const emptyValues = requiredValues.filter((v) => !v || v.trim() === '');
    if (emptyValues.length > 0) {
      throw new Error('Some environment variables are empty');
    }

    console.log('✓ Environment configuration validated successfully');
  } catch (error) {
    console.error('✗ Environment configuration validation failed');
    throw error;
  }
}
