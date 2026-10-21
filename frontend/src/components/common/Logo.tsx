import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-soft ring-1 ring-white/20',
        className
      )}
    >
      <Sprout className="h-[22px] w-[22px]" strokeWidth={2.2} />
    </span>
  );
}

interface LogoProps {
  to?: string;
  /** 'light' renders white wordmark (for dark-green surfaces). */
  tone?: 'auto' | 'light';
  compact?: boolean;
  className?: string;
}

export function Logo({ to = '/', tone = 'auto', compact = false, className }: LogoProps) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5 outline-none', className)} aria-label="FreshmCalc home">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-[19px] font-extrabold tracking-tight',
              tone === 'light' ? 'text-white' : 'text-foreground'
            )}
          >
            Fresh<span className={tone === 'light' ? 'text-lime-300' : 'text-brand-600 dark:text-brand-400'}>mCalc</span>
          </span>
          <span
            className={cn(
              'mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
              tone === 'light' ? 'text-brand-200/80' : 'text-muted-foreground'
            )}
          >
            Dubai · AED Rates
          </span>
        </span>
      )}
    </Link>
  );
}
