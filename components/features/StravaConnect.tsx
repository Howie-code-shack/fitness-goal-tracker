'use client';

import { trpc } from '@/lib/api/trpc-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface StravaConnectProps {
  lastSyncedAt?: Date | string | null;
  manualSync?: () => void;
  isAutoSyncing?: boolean;
}

export function StravaConnect({ lastSyncedAt, manualSync, isAutoSyncing }: StravaConnectProps) {
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

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl.url;
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Disconnected from Strava');
        // Invalidate queries to refresh connection status
        utils.strava.isConnected.invalidate();
        utils.strava.getAthlete.invalidate();
      },
      onError: (error) => {
        toast.error('Failed to disconnect', {
          description: error.message,
        });
      },
    });
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
                {lastSyncedAt ? (
                  `Last synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
                ) : athlete?.username ? (
                  `@${athlete.username}`
                ) : (
                  'Auto-sync enabled'
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={manualSync}
              disabled={isAutoSyncing || disconnectMutation.isPending}
              size="lg"
            >
              {isAutoSyncing ? 'Syncing...' : 'Sync Activities'}
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
      </CardContent>
    </Card>
  );
}
