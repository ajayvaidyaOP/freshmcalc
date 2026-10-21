'use client';

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { FlaskConical, ShieldCheck, UserRound, X } from 'lucide-react';
import { clearAuth, getAuth } from '@/lib/api';
import { isDemoMode, setDemoRole } from '@/lib/demo';
import { cn } from '@/lib/utils';

/** Floating banner shown only in demo mode — labels sample data & allows role switching. */
export function DemoBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  const location = useLocation();
  if (!isDemoMode() || dismissed) return null;

  // The Calculator has its own sticky save bar — float above it there.
  const onCalculator = location.pathname === '/calculator';
  const { user } = getAuth();
  const isAdmin = user?.role === 'ADMIN';

  const switchRole = (role: 'CUSTOMER' | 'ADMIN') => {
    setDemoRole(role);
    window.location.href = role === 'ADMIN' ? '/admin' : '/dashboard';
  };

  const exit = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div
      className={cn(
        'fixed inset-x-3 z-[55] flex justify-center md:inset-x-auto md:right-5 md:justify-end',
        onCalculator
          ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+140px)] md:bottom-24 lg:bottom-5'
          : 'bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] md:bottom-5'
      )}
    >
      <div className="surface-forest flex w-full max-w-[520px] items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-lift ring-1 ring-white/15 animate-toast-in">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-brand-950">
          <FlaskConical className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[13px] font-extrabold">Demo mode · Sample Dubai data</p>
          <p className="truncate text-[11px] text-brand-200/80">Explore freely — nothing here touches the real server.</p>
        </div>
        <button
          type="button"
          onClick={() => switchRole(isAdmin ? 'CUSTOMER' : 'ADMIN')}
          className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-extrabold ring-1 ring-white/20 transition-colors hover:bg-white/20"
        >
          {isAdmin ? <UserRound className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {isAdmin ? 'Trader view' : 'Admin view'}
        </button>
        <button
          type="button"
          onClick={exit}
          className="shrink-0 rounded-lg bg-lime-400 px-3 py-2 text-xs font-extrabold text-brand-950 transition-colors hover:bg-lime-300"
        >
          Exit
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide demo banner"
          className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-200/70 transition-colors hover:bg-white/10 hover:text-white')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
