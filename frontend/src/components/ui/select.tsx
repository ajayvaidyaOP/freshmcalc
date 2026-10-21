'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectLabel = SelectPrimitive.Label;
export const SelectSeparator = SelectPrimitive.Separator;
export const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
export const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <span className="mx-2 h-4 w-4">
        <ChevronDown className="h-4 w-4" />
      </span>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPortal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn('rounded-md border border-input bg-background py-1 text-sm z-50 shadow-md outline-none', className)}
        position={position}
        {...props}
      >
        {children}
      </SelectPrimitive.Content>
    </SelectPortal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

function SelectPortal({ children }: { children: React.ReactNode }) {
  return <SelectPrimitive.Portal>{children}</SelectPrimitive.Portal>;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn('relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <div className="pl-7">{children}</div>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;
