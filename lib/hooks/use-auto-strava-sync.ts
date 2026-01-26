"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { trpc } from "@/lib/api/trpc-client";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface UseAutoStravaSyncOptions {
  enabled?: boolean;
}

const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes minimum between syncs

export function useAutoStravaSync(options: UseAutoStravaSyncOptions = {}) {
  const { enabled = true } = options;

  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const lastSyncTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const utils = trpc.useUtils();

  // Check if user is connected to Strava
  const { data: isConnected } = trpc.strava.isConnected.useQuery(undefined, {
    enabled,
  });

  // Get last synced timestamp
  const { data: lastSyncedAt, refetch: refetchLastSyncedAt } =
    trpc.strava.getLastSyncedAt.useQuery(undefined, {
      enabled: enabled && isConnected,
    });

  // Sync mutation
  const syncMutation = trpc.strava.syncAndImportActivities.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries to refresh UI
      utils.goals.getGoals.invalidate();
      utils.goals.getAllProgressStats.invalidate();
      refetchLastSyncedAt();
    },
  });

  // Sync function with rate limiting
  const sync = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options;

      if (!isConnected) {
        if (!silent) {
          toast.error("Not connected to Strava");
        }
        return;
      }

      // Rate limiting: prevent syncs within 5 minutes
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;

      if (timeSinceLastSync < MIN_SYNC_INTERVAL) {
        if (!silent) {
          const remainingMinutes = Math.ceil(
            (MIN_SYNC_INTERVAL - timeSinceLastSync) / 60000
          );
          toast.error(
            `Please wait ${remainingMinutes} minute${
              remainingMinutes > 1 ? "s" : ""
            } before syncing again`
          );
        }
        return;
      }

      setIsAutoSyncing(true);
      lastSyncTimeRef.current = now;

      try {
        const result = await syncMutation.mutateAsync({});

        if (!silent) {
          if (result.synced === 0) {
            toast.success("No new activities found");
          } else {
            const newActivities = result.imported;
            toast.success(
              `Successfully synced ${result.synced} ${
                result.synced === 1 ? "activity" : "activities"
              }`,
              {
                description: newActivities
                  ? `Imported ${newActivities} new ${
                      newActivities === 1 ? "activity" : "activities"
                    }`
                  : undefined,
              }
            );
          }
        }
      } catch (error) {
        // Handle UNAUTHORIZED error (token expired)
        if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") {
          if (!silent) {
            toast.error("Your Strava connection expired", {
              description: "Please reconnect your Strava account.",
            });
          }
          // Invalidate connection status to update UI
          utils.strava.isConnected.invalidate();
        } else {
          // Other errors
          if (!silent) {
            const message =
              error instanceof Error ? error.message : "Unknown error occurred";
            toast.error("Failed to sync with Strava", {
              description: message,
            });
          }
          // Log error for debugging but don't interrupt user
          console.error("Strava sync failed:", error);
        }
      } finally {
        setIsAutoSyncing(false);
      }
    },
    [isConnected, syncMutation, utils]
  );

  // Manual sync function (always shows toasts)
  const manualSync = useCallback(() => {
    sync({ silent: false });
  }, [sync]);

  // Auto-sync on mount and set up interval
  useEffect(() => {
    if (!enabled || !isConnected) {
      return;
    }

    // Sync once on mount (silent)
    sync({ silent: true });

    // Set up interval for background sync
    intervalIdRef.current = setInterval(() => {
      sync({ silent: true });
    }, SYNC_INTERVAL);

    // Cleanup
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [enabled, isConnected, sync]);

  return {
    isAutoSyncing,
    lastSyncedAt,
    manualSync,
    isConnected,
  };
}
