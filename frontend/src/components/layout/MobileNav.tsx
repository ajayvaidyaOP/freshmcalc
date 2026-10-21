'use client';

import { Link, useLocation } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOBILE_NAV_ITEMS, isActivePath } from './nav-items';

/**
 * App-style bottom navigation for phones. The Export Calculator sits in a
 * raised centre button — it's the #1 action traders use on the go.
 */
export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile"
      className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/80 md:hidden"
    >
      <div className="grid grid-cols-5 px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActivePath(location.pathname, item.href);
          const isCentre = item.icon === Calculator;

          if (isCentre) {
            return (
              <div key={item.href} className="relative flex justify-center">
                <Link
                  to={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'absolute -top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow ring-4 ring-background transition-all active:scale-95',
                    active && 'from-brand-600 to-brand-800'
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
                <span
                  className={cn(
                    'flex min-h-[56px] items-end pb-1.5 pt-7 text-[10px] font-bold',
                    active ? 'text-brand-700 dark:text-brand-300' : 'text-muted-foreground'
                  )}
                >
                  {item.shortLabel}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl py-1.5"
            >
              <span
                className={cn(
                  'flex h-7 w-12 items-center justify-center rounded-full transition-all',
                  active ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={cn('text-[10px] font-bold leading-none', active ? 'text-brand-800 dark:text-brand-200' : 'text-muted-foreground')}>
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
