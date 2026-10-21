'use client';

import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function Navbar({ user, onToggle }: { user: any; onToggle: () => void }) {
  const location = useLocation();
  const hideOnAuth = ['/login', '/register', '/pricing'];
  const show = !hideOnAuth.includes(location.pathname);

  return (
    show ? (
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-input bg-background/80 backdrop-blur px-4">
        <button onClick={onToggle} className="mr-3 p-2 text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </button>
        <Link to="/" className="mr-auto text-xl font-bold tracking-tight text-primary">FreshmCalc</Link>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="search" placeholder="Search Dubai rates..." className="h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <Bell className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <img src="https://flagsapi.com/AE/flat/64.png" alt="UAE" className="h-5 w-5 rounded" />
                <span>AED</span>
                <ChevronDownIcon size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Dubai, UAE (AED)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden md:flex items-center gap-2 text-right">
              <p className="text-sm font-medium">{user?.email || 'Guest'}</p>
              <p className="text-xs text-muted-foreground">{user?.role || ''}</p>
            </div>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Sun size={18} />
            </button>
          </div>
        </div>
      </header>
    ) : null
  );
}

function ChevronDownIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
