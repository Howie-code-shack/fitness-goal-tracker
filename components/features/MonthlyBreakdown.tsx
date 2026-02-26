'use client';

import { trpc } from '@/lib/api/trpc-client';
import type { GoalType } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthlyBreakdownProps {
  goalType: GoalType;
}

export function MonthlyBreakdown({ goalType }: MonthlyBreakdownProps) {
  const { data: monthlyData } = trpc.goals.getMonthlyBreakdown.useQuery({ goalType });
  const { data: goals } = trpc.goals.getGoals.useQuery();

  const goal = goals?.find((g) => g.type === goalType);
  const isSwimming = goalType === 'swimming';
  const unit = isSwimming ? 'm' : 'km';
  const decimals = isSwimming ? 0 : 1;

  const monthlyTarget = goal ? goal.yearlyTarget / 12 : 0;

  const chartData = useMemo(() => {
    if (!monthlyData) return [];
    return monthlyData.map((d) => ({
      month: MONTH_LABELS[d.month],
      total: d.total,
    }));
  }, [monthlyData]);

  if (!monthlyData || !goal) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis
          dataKey="month"
          stroke="#6B7280"
          style={{ fontSize: '0.875rem' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '0.875rem' }}
          domain={[0, (dataMax: number) => Math.max(dataMax, monthlyTarget * 1.1)]}
          label={{ value: `Distance (${unit})`, angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#F9FAFB',
          }}
          formatter={(value?: number) => [value !== undefined ? `${value.toFixed(decimals)} ${unit}` : '', 'Total']}
        />
        <ReferenceLine
          y={monthlyTarget}
          stroke="#9CA3AF"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{ value: `Target: ${monthlyTarget.toFixed(decimals)} ${unit}`, position: 'right', fill: '#9CA3AF', fontSize: 12 }}
        />
        <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
