import * as React from 'react';
import { Apple, Banana, Carrot, Cherry, Citrus, Grape, Leaf, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { freshness, timeAgo } from '@/lib/format';

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  pomegranate: Apple,
  apple: Apple,
  banana: Banana,
  grapes: Grape,
  grape: Grape,
  mango: Citrus,
  orange: Citrus,
  lemon: Citrus,
  citrus: Citrus,
  cherry: Cherry,
  chilli: Leaf,
  chili: Leaf,
  pepper: Leaf,
  carrot: Carrot,
  onion: Sprout,
  potato: Sprout,
  tomato: Apple,
};

export function productIcon(name?: string): React.ElementType {
  if (!name) return Sprout;
  const key = Object.keys(PRODUCT_ICONS).find((k) => name.toLowerCase().includes(k));
  return key ? PRODUCT_ICONS[key] : Sprout;
}

/** Rounded product icon tile used in rate lists and cards. */
export function ProductAvatar({ name, className }: { name?: string; className?: string }) {
  const Icon = productIcon(name);
  return (
    <span
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-brand-100 shadow-sm',
        className
      )}
      aria-hidden="true"
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

const FRESHNESS_DOT: Record<string, string> = {
  fresh: 'bg-brand-500',
  recent: 'bg-amber-400',
  stale: 'bg-red-400',
  unknown: 'bg-muted-foreground/50',
};

/** Small "● Updated 2 hrs ago" freshness indicator for market rates. */
export function FreshnessTag({ value, className }: { value?: string | null; className?: string }) {
  const level = freshness(value);
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground', className)}>
      <span className={cn('relative flex h-2 w-2')}>
        {level === 'fresh' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', FRESHNESS_DOT[level])} />
      </span>
      Updated {timeAgo(value).toLowerCase()}
    </span>
  );
}
