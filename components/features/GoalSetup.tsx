'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateGoalsSchema, type UpdateGoalsInput } from '@/lib/validations/goal';
import { trpc } from '@/lib/api/trpc-client';
import { cn } from '@/lib/utils';

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
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Set Your {new Date().getFullYear()} Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your target distances for the year
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {goalTypes.map((goalType) => (
            <div key={goalType.key} className="space-y-2">
              <label className="flex items-center gap-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                <span className={cn('w-12 h-12 rounded-full flex items-center justify-center text-2xl', goalType.color)}>
                  {goalType.icon}
                </span>
                {goalType.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step={goalType.key === 'swimming' ? '1' : '0.1'}
                  {...register(goalType.key, { valueAsNumber: true })}
                  className={cn(
                    'flex-1 px-4 py-3 text-lg border-2 rounded-lg',
                    'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors[goalType.key]
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  )}
                  placeholder="0"
                />
                <span className="text-gray-600 dark:text-gray-300 font-medium">{goalType.unit}</span>
              </div>
              {errors[goalType.key] && (
                <p className="text-red-500 text-sm mt-1">{errors[goalType.key]?.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 px-6 rounded-lg font-semibold text-lg text-white',
              'transition-all duration-200',
              'focus:ring-4 focus:ring-offset-2 focus:outline-none',
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105'
            )}
          >
            {isSubmitting ? 'Setting Goals...' : 'Start Tracking'}
          </button>
        </form>
      </div>
    </div>
  );
}
