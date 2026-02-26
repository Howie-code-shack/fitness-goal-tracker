'use client';

import { useState } from 'react';
import { trpc } from '@/lib/api/trpc-client';
import { GoalSetup } from '@/components/features/GoalSetup';
import { Dashboard } from '@/components/features/Dashboard';

export default function Home() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [editing, setEditing] = useState(false);
  const { data: hasGoals, isLoading } = trpc.goals.hasGoals.useQuery();
  const { data: goals } = trpc.goals.getGoals.useQuery();
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (editing && goals) {
    const initialValues = {
      running: goals.find((g) => g.type === 'running')?.yearlyTarget ?? 400,
      cycling: goals.find((g) => g.type === 'cycling')?.yearlyTarget ?? 4000,
      swimming: goals.find((g) => g.type === 'swimming')?.yearlyTarget ?? 80000,
    };

    return (
      <GoalSetup
        initialValues={initialValues}
        onComplete={() => {
          setEditing(false);
          utils.goals.getGoals.invalidate();
          utils.goals.getAllProgressStats.invalidate();
          utils.goals.hasGoals.invalidate();
        }}
      />
    );
  }

  if (!hasGoals && !setupComplete) {
    return <GoalSetup onComplete={() => setSetupComplete(true)} />;
  }

  return <Dashboard onEditGoals={() => setEditing(true)} />;
}
