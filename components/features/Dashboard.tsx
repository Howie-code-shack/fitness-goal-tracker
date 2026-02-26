'use client';

import { GoalCard } from './GoalCard';
import { ProgressGraph } from './ProgressGraph';
import { StravaConnect } from './StravaConnect';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { trpc } from '@/lib/api/trpc-client';
import { cn } from '@/lib/utils';
import type { GoalType } from '@/types';
import { useAutoStravaSync } from '@/lib/hooks/use-auto-strava-sync';

interface DashboardProps {
  onEditGoals: () => void;
}

const ALL_GOAL_TYPES = [
  { key: 'running' as const, label: 'Running', icon: '🏃', color: 'bg-blue-500' },
  { key: 'cycling' as const, label: 'Cycling', icon: '🚴', color: 'bg-green-500' },
  { key: 'swimming' as const, label: 'Swimming', icon: '🏊', color: 'bg-purple-500' },
];

export function Dashboard({ onEditGoals }: DashboardProps) {
  const { data: goals } = trpc.goals.getGoals.useQuery();
  const enabledTypes = goals?.map((g) => g.type) ?? [];
  const goalTypes = ALL_GOAL_TYPES.filter((gt) => enabledTypes.includes(gt.key));

  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  // Default selectedGoal to first enabled sport once goals load
  const activeGoal = selectedGoal && enabledTypes.includes(selectedGoal)
    ? selectedGoal
    : (goalTypes[0]?.key ?? null);

  // Auto-sync Strava activities
  const { isAutoSyncing, lastSyncedAt, manualSync } = useAutoStravaSync({
    enabled: true,
  });

  // Fetch all progress stats to determine the most urgent activity
  const { data: allStats } = trpc.goals.getAllProgressStats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Fitness Goal Tracker
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track your progress for {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEditGoals}>
              Edit Goals
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Strava Connection */}
        <div className="mb-8">
          <StravaConnect
            lastSyncedAt={lastSyncedAt}
            manualSync={manualSync}
            isAutoSyncing={isAutoSyncing}
          />
        </div>

        {/* Goal Cards Grid */}
        {goalTypes.length > 0 && (
          <div className={cn(
            'grid grid-cols-1 gap-6 mb-8',
            goalTypes.length === 1 && 'md:grid-cols-1 max-w-md',
            goalTypes.length === 2 && 'md:grid-cols-2',
            goalTypes.length === 3 && 'md:grid-cols-3',
          )}>
            {goalTypes.map((goalType) => (
              <button
                key={goalType.key}
                onClick={() => setSelectedGoal(goalType.key)}
                className="text-left focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-xl transition-all"
              >
                <GoalCard
                  goalType={goalType.key}
                  label={goalType.label}
                  icon={goalType.icon}
                  color={goalType.color}
                  isMostUrgent={allStats?.mostUrgent === goalType.key}
                />
              </button>
            ))}
          </div>
        )}

        {/* Progress Graph */}
        {activeGoal && <ProgressGraph goalType={activeGoal} />}
      </div>
    </div>
  );
}
