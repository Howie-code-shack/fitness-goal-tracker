'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/features/ThemeToggle';

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
      )}
      <span className="text-sm font-medium hidden sm:inline">
        {session.user.name || session.user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </Button>
    </div>
  );
}
