'use client';

import { GoalCard } from './GoalCard';
import { ProgressGraph } from './ProgressGraph';
import { StravaConnect } from './StravaConnect';
import { useState } from 'react';
import { trpc } from '@/lib/api/trpc-client';
import type { GoalType } from '@/types';

export function Dashboard() {
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('running');
  const utils = trpc.useUtils();

  const goalTypes = [
    { key: 'running' as const, label: 'Running', icon: '🏃', color: 'bg-blue-500' },
    { key: 'cycling' as const, label: 'Cycling', icon: '🚴', color: 'bg-green-500' },
    { key: 'swimming' as const, label: 'Swimming', icon: '🏊', color: 'bg-purple-500' },
  ];

  const handleSync = () => {
    // Invalidate queries to refetch data after sync
    utils.goals.invalidate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Fitness Goal Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your progress for {new Date().getFullYear()}
          </p>
        </div>

        {/* Strava Connection */}
        <div className="mb-8">
          <StravaConnect onSync={handleSync} />
        </div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              />
            </button>
          ))}
        </div>

        {/* Progress Graph */}
        <ProgressGraph goalType={selectedGoal} />
      </div>
    </div>
  );
}
