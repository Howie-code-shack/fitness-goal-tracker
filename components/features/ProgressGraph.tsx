'use client';

import { trpc } from '@/lib/api/trpc-client';
import type { GoalType } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyBreakdown } from './MonthlyBreakdown';

interface ProgressGraphProps {
  goalType: GoalType;
}

type ViewTab = 'yearly' | 'monthly';

export function ProgressGraph({ goalType }: ProgressGraphProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('yearly');
  const { data: goals } = trpc.goals.getGoals.useQuery();
  const { data: stats } = trpc.goals.getProgressStats.useQuery({ goalType });
  const { data: weeklyBreakdown } = trpc.goals.getWeeklyBreakdown.useQuery({ goalType });

  const goal = goals?.find((g) => g.type === goalType);
  const isSwimming = goalType === 'swimming';
  const unit = isSwimming ? 'm' : 'km';
  const decimals = isSwimming ? 0 : 1;

  const { chartData, monthTickWeeks, weekLabels } = useMemo(() => {
    if (!goal || !stats || !weeklyBreakdown) {
      return { chartData: [], monthTickWeeks: [] as number[], weekLabels: {} as Record<number, string> };
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const now = new Date();
    const currentDayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(currentDayOfYear / 7);

    // Map week index -> month abbreviation for x-axis labels
    const weekLabels: Record<number, string> = {};
    const monthTickWeeks: number[] = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const dayOfYear = Math.floor((monthStart.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      const week = Math.floor(dayOfYear / 7);
      weekLabels[week] = monthStart.toLocaleString('default', { month: 'short' });
      monthTickWeeks.push(week);
    }

    const weeklyTarget = goal.yearlyTarget / 52;
    let cumulativeActual = 0;

    const chartData = weeklyBreakdown.map(({ week, total }) => {
      const isPast = week <= currentWeek;
      if (isPast) {
        cumulativeActual += total;
      }
      return {
        week,
        target: weeklyTarget * (week + 1),
        actual: isPast ? cumulativeActual : null,
      };
    });

    return { chartData, monthTickWeeks, weekLabels };
  }, [goal, stats, weeklyBreakdown]);

  if (!goal || !stats) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">Loading graph...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progress Over Time</CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['yearly', 'monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'yearly' ? 'Yearly' : 'Monthly'}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'yearly' ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="week"
                stroke="#6B7280"
                style={{ fontSize: '0.875rem' }}
                ticks={monthTickWeeks}
                tickFormatter={(week: number) => weekLabels[week] ?? ''}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '0.875rem' }}
                tickFormatter={(value: number) => value.toFixed(decimals)}
                label={{ value: `Distance (${unit})`, angle: -90, position: 'insideLeft', offset: -15, style: { fill: '#6B7280' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB',
                }}
                formatter={(value?: number) => [value !== undefined ? `${value.toFixed(decimals)} ${unit}` : '', '']}
                labelFormatter={(week: number) => `Week ${week + 1}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '1rem' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                name="Target"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Your Progress"
                dot={false}
                activeDot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <MonthlyBreakdown goalType={goalType} />
        )}
      </CardContent>
    </Card>
  );
}
