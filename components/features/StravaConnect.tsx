'use client';

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc-client';
import { storage } from '@/lib/db/storage';
import { cn } from '@/lib/utils';

interface StravaConnectProps {
  onSync?: () => void;
}

export function StravaConnect({ onSync }: StravaConnectProps) {
  const [isConnected, setIsConnected] = useState(() => {
    return storage.getStravaTokens() !== null;
  });

  const { data: authUrl } = trpc.strava.getAuthUrl.useQuery();
  const disconnectMutation = trpc.strava.disconnect.useMutation();
  const syncMutation = trpc.strava.syncActivities.useMutation();
  const importActivitiesMutation = trpc.goals.importActivities.useMutation();

  const athlete = storage.getStravaAthlete();

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl.url;
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        storage.clearStravaTokens();
        setIsConnected(false);
      },
    });
  };

  const handleSync = () => {
    // Get activities from the start of current year
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const after = Math.floor(yearStart.getTime() / 1000);

    syncMutation.mutate(
      { after },
      {
        onSuccess: (data) => {
          console.log(`Fetched ${data.count} activities from Strava`);

          // Import the activities into the goals system
          if (data.activities.length > 0) {
            importActivitiesMutation.mutate(data.activities, {
              onSuccess: (importResult) => {
                console.log(`Imported ${importResult.imported} activities`);
                onSync?.();
              },
            });
          } else {
            onSync?.();
          }
        },
      }
    );
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Connect to Strava
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automatically sync your activities from Strava
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 focus:ring-4 focus:ring-orange-300"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {athlete ? `${athlete.firstname} ${athlete.lastname}` : 'Strava Connected'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {athlete?.username && `@${athlete.username}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className={cn(
              'px-6 py-3 font-semibold rounded-lg transition-all',
              syncMutation.isPending
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            )}
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Activities'}
          </button>
          <button
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>

      {syncMutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Successfully synced {syncMutation.data.count} activities from Strava
          </p>
        </div>
      )}

      {syncMutation.isError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            ✗ Failed to sync activities: {syncMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
}
