'use client';

import { trpc } from '@/lib/api/trpc-client';
import type { GoalType } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface ProgressGraphProps {
  goalType: GoalType;
}

export function ProgressGraph({ goalType }: ProgressGraphProps) {
  const { data: goals } = trpc.goals.getGoals.useQuery();
  const { data: stats } = trpc.goals.getProgressStats.useQuery({ goalType });

  const goal = goals?.find((g) => g.type === goalType);

  const chartData = useMemo(() => {
    if (!goal || !stats) return [];

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const now = new Date();
    const monthsPassed = now.getMonth() + 1;

    const data = [];
    const monthlyTarget = goal.yearlyTarget / 12;
    const currentMonthlyProgress = stats.distanceCompleted / monthsPassed;

    for (let month = 0; month <= 11; month++) {
      const monthDate = new Date(currentYear, month, 1);
      const isCurrentOrFuture = monthDate > now;

      data.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        target: monthlyTarget * (month + 1),
        actual: isCurrentOrFuture ? null : Math.min(currentMonthlyProgress * (month + 1), stats.distanceCompleted),
      });
    }

    // Set the current month's actual progress
    data[monthsPassed - 1].actual = stats.distanceCompleted;

    return data;
  }, [goal, stats]);

  if (!goal || !stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading graph...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="month"
            stroke="#6B7280"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '0.875rem' }}
            label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#F9FAFB',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} km`, '']}
          />
          <Legend
            wrapperStyle={{ paddingTop: '1rem' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3B82F6"
            strokeWidth={3}
            name="Your Progress"
            dot={{ fill: '#3B82F6', r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
