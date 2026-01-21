'use client';

import { trpc } from '@/lib/api/trpc-client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GoalType } from '@/types';

interface GoalCardProps {
  goalType: GoalType;
  label: string;
  icon: string;
  color: string;
  isMostUrgent?: boolean;
}

export function GoalCard({ goalType, label, icon, color, isMostUrgent }: GoalCardProps) {
  const { data: goals } = trpc.goals.getGoals.useQuery();
  const { data: stats } = trpc.goals.getProgressStats.useQuery({ goalType });

  const goal = goals?.find((g) => g.type === goalType);

  if (!goal || !stats) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const isAhead = stats.distanceAheadBehind > 0;
  const progressPercentage = Math.min(100, stats.percentComplete);
  const isSwimming = goalType === 'swimming';
  const unit = isSwimming ? 'm' : 'km';

  return (
    <Card className={cn(
      "hover:shadow-xl transition-shadow relative",
      isMostUrgent && "ring-2 ring-orange-500 ring-offset-2"
    )}>
      {/* Urgency Badge */}
      {isMostUrgent && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          Priority
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-3xl', color)}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl">{label}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {goal.yearlyTarget.toFixed(0)} {unit} goal
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-bold">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', color)}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Completed
            </p>
            <p className="text-2xl font-bold">
              {stats.distanceCompleted.toFixed(isSwimming ? 0 : 1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Remaining
            </p>
            <p className="text-2xl font-bold">
              {stats.distanceRemaining.toFixed(isSwimming ? 0 : 1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </p>
          </div>

          <div className="col-span-2 pt-3 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Ahead/Behind Schedule
            </p>
            <div className="flex items-baseline gap-3">
              <p
                className={cn(
                  'text-xl font-bold',
                  isAhead ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {isAhead ? '+' : ''}
                {stats.distanceAheadBehind.toFixed(isSwimming ? 0 : 1)}
                <span className="text-sm font-normal ml-1">{unit}</span>
              </p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  isAhead ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                ({isAhead ? '+' : ''}{stats.percentBehind.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
