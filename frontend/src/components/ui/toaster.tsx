'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast, dismissToast, type ToastVariant } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastVariant, React.ElementType> = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
};

const STYLES: Record<ToastVariant, string> = {
  default: 'border-border bg-card text-card-foreground',
  success: 'border-brand-300 bg-brand-700 text-white dark:border-brand-700 dark:bg-brand-800',
  destructive: 'border-red-300 bg-red-600 text-white dark:border-red-800',
};

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-[100] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:top-5 sm:bottom-auto sm:w-[380px] lg:bottom-auto"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.variant || 'default'];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lift transition-all duration-300',
              STYLES[t.variant || 'default'],
              t.open ? 'animate-toast-in opacity-100' : 'translate-y-2 opacity-0'
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] leading-snug opacity-90">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(t.id)}
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
