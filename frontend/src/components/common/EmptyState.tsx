import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Friendly empty / no-results placeholder with a soft green illustration disc. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center sm:py-16', className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-brand-100/70 blur-xl dark:bg-brand-900/50" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 ring-1 ring-brand-200 dark:from-brand-900 dark:to-brand-950 dark:text-brand-300 dark:ring-brand-800">
          <Icon className="h-8 w-8" strokeWidth={1.6} />
        </div>
      </div>
      <h3 className="font-display text-base font-bold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
