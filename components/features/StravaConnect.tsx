'use client';

import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StravaConnectProps {
  onSync?: () => void;
}

export function StravaConnect({ onSync }: StravaConnectProps) {
  // Use database query for connection status (not localStorage)
  const { data: isConnected, isLoading: isLoadingConnection } = trpc.strava.isConnected.useQuery();

  // Fetch athlete from Strava API if connected (optional - for display only)
  const { data: athlete } = trpc.strava.getAthlete.useQuery(undefined, {
    enabled: isConnected === true,
    retry: false, // Don't retry if it fails
  });

  const { data: authUrl } = trpc.strava.getAuthUrl.useQuery();
  const utils = trpc.useUtils();
  const disconnectMutation = trpc.strava.disconnect.useMutation();
  const syncAndImportMutation = trpc.strava.syncAndImportActivities.useMutation();

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl.url;
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        // Tokens are deleted from database by the mutation
        // Invalidate queries to refresh connection status
        utils.strava.isConnected.invalidate();
        utils.strava.getAthlete.invalidate();
      },
    });
  };

  const handleSync = () => {
    // Get activities from the start of current year
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const after = Math.floor(yearStart.getTime() / 1000);

    syncAndImportMutation.mutate(
      { after },
      {
        onSuccess: (data) => {
          console.log(`Synced and imported ${data.imported} of ${data.synced} activities from Strava`);
          onSync?.();
        },
        onError: (error) => {
          console.error('Failed to sync and import activities from Strava:', error);
        },
      }
    );
  };

  // Show loading state while checking connection
  if (isLoadingConnection) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                Connect to Strava
              </h3>
              <p className="text-sm text-muted-foreground">
                Automatically sync your activities from Strava
              </p>
            </div>
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              size="lg"
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {athlete?.profile_medium ? (
                <img
                  src={athlete.profile_medium}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                {athlete ? `${athlete.firstname} ${athlete.lastname}` : 'Strava Connected'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {athlete?.username && `@${athlete.username}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={syncAndImportMutation.isPending}
              size="lg"
            >
              {syncAndImportMutation.isPending ? 'Syncing...' : 'Sync Activities'}
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              variant="ghost"
              className="hover:text-red-600 dark:hover:text-red-400"
            >
              Disconnect
            </Button>
          </div>
        </div>

        {syncAndImportMutation.isSuccess && syncAndImportMutation.data && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Successfully synced {syncAndImportMutation.data.synced} activities and imported {syncAndImportMutation.data.imported} to database.
              Total activities: {syncAndImportMutation.data.totalActivities}
            </p>
            {'errors' in syncAndImportMutation.data && syncAndImportMutation.data.errors && syncAndImportMutation.data.errors.length > 0 && (
              <p className="text-sm text-orange-800 dark:text-orange-200 mt-2">
                ⚠ {syncAndImportMutation.data.errors.length} activities failed to import. Check console for details.
              </p>
            )}
          </div>
        )}

        {syncAndImportMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ✗ Failed to sync activities from Strava: {syncAndImportMutation.error.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
