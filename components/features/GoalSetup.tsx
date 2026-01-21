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

export function GoalSetup({ onComplete }: { onComplete: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateGoalsMutation = trpc.goals.updateGoals.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGoalsInput>({
    resolver: zodResolver(updateGoalsSchema),
    defaultValues: {
      running: 400,
      cycling: 4000,
      swimming: 80000,
    },
  });

  const onSubmit = async (data: UpdateGoalsInput) => {
    setIsSubmitting(true);
    try {
      await updateGoalsMutation.mutateAsync(data);
      onComplete();
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">
            Set Your {new Date().getFullYear()} Goals
          </CardTitle>
          <CardDescription className="text-lg">
            Enter your target distances for the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {goalTypes.map((goalType) => (
              <div key={goalType.key} className="space-y-2">
                <Label className="flex items-center gap-3 text-lg font-semibold">
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
                    className={cn(
                      'flex-1 text-lg h-12',
                      errors[goalType.key] && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    placeholder="0"
                  />
                  <span className="text-muted-foreground font-medium">{goalType.unit}</span>
                </div>
                {errors[goalType.key] && (
                  <p className="text-red-500 text-sm">{errors[goalType.key]?.message}</p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {isSubmitting ? 'Setting Goals...' : 'Start Tracking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
