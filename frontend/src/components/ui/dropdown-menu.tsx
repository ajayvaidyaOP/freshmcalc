'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>;

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuCheckboxItem = DropdownMenuPrimitive.CheckboxItem;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = DropdownMenuPrimitive.RadioItem;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPortal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={cn(
        'rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-zoom-in dropdown-menu-in slide-in-from-top-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPortal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <DropdownMenuPrimitive.Portal>{children}</DropdownMenuPrimitive.Portal>;
}
