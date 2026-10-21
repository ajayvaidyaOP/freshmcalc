'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-xs font-semibold text-foreground', className)}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn('rounded-md px-3 py-1 text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)}
      {...props}
    />
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={cn('mt-2 text-sm leading-6', className)} {...props} />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;
