'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateGoalsSchema, type UpdateGoalsInput } from '@/lib/validations/goal';
import { trpc } from '@/lib/api/trpc-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/features/ThemeToggle';

type SportKey = 'running' | 'cycling' | 'swimming';

interface GoalSetupProps {
  onComplete: () => void;
  initialValues?: { running: number | null; cycling: number | null; swimming: number | null };
}

export function GoalSetup({ onComplete, initialValues }: GoalSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledSports, setEnabledSports] = useState<Record<SportKey, boolean>>({
    running: initialValues ? initialValues.running !== null : true,
    cycling: initialValues ? initialValues.cycling !== null : true,
    swimming: initialValues ? initialValues.swimming !== null : true,
  });
  const updateGoalsMutation = trpc.goals.updateGoals.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ running: number; cycling: number; swimming: number }>({
    defaultValues: {
      running: initialValues?.running ?? 400,
      cycling: initialValues?.cycling ?? 4000,
      swimming: initialValues?.swimming ?? 80000,
    },
  });

  const toggleSport = (key: SportKey) => {
    setEnabledSports((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data: { running: number; cycling: number; swimming: number }) => {
    const payload: UpdateGoalsInput = {
      running: enabledSports.running ? data.running : null,
      cycling: enabledSports.cycling ? data.cycling : null,
      swimming: enabledSports.swimming ? data.swimming : null,
    };

    // Validate at least one sport is enabled
    if (!enabledSports.running && !enabledSports.cycling && !enabledSports.swimming) {
      setError('At least one sport must be enabled');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await updateGoalsMutation.mutateAsync(payload);
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set goals. Please try again.';
      setError(message);
      console.error('Failed to set goals:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalTypes = [
    { key: 'running' as const, label: 'Running', icon: '🏃', color: 'bg-blue-500', unit: 'km' },
    { key: 'cycling' as const, label: 'Cycling', icon: '🚴', color: 'bg-green-500', unit: 'km' },
    { key: 'swimming' as const, label: 'Swimming', icon: '🏊', color: 'bg-purple-500', unit: 'm' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">
            {initialValues ? 'Edit' : 'Set'} Your {new Date().getFullYear()} Goals
          </CardTitle>
          <CardDescription className="text-lg">
            {initialValues ? 'Update your target distances' : 'Enter your target distances for the year'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {goalTypes.map((goalType) => {
              const isEnabled = enabledSports[goalType.key];
              return (
                <div key={goalType.key} className={cn('space-y-2', !isEnabled && 'opacity-50')}>
                  <Label className="flex items-center gap-3 text-lg font-semibold">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleSport(goalType.key)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={cn('w-12 h-12 rounded-full flex items-center justify-center text-2xl', goalType.color)}>
                      {goalType.icon}
                    </span>
                    {goalType.label}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step={goalType.key === 'swimming' ? '1' : '0.1'}
                      {...register(goalType.key, { valueAsNumber: true })}
                      disabled={!isEnabled}
                      className={cn(
                        'flex-1 text-lg h-12',
                        errors[goalType.key] && isEnabled && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      placeholder="0"
                    />
                    <span className="text-muted-foreground font-medium">{goalType.unit}</span>
                  </div>
                  {errors[goalType.key] && isEnabled && (
                    <p className="text-red-500 text-sm">{errors[goalType.key]?.message}</p>
                  )}
                </div>
              );
            })}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {isSubmitting ? 'Saving...' : initialValues ? 'Update Goals' : 'Start Tracking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
