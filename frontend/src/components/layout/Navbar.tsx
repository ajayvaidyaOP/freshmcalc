'use client';

import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, CreditCard, LogOut, MapPin, Menu, Search, Settings, UserRound } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Logo } from '@/components/common/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clearAuth } from '@/lib/api';
import { displayName, initials } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Market Overview',
  '/rates': 'Dubai Live Rates',
  '/rates/history': 'Price History',
  '/calculator': 'Export Calculator',
  '/calculations': 'Saved Cost Sheets',
  '/subscription': 'Subscription & Billing',
  '/settings': 'Account Settings',
  '/admin': 'Admin Dashboard',
  '/admin/rates': 'Manage Market Rates',
  '/admin/products': 'Products & Varieties',
  '/admin/ports': 'Ports & Routes',
  '/admin/users': 'Users & Subscriptions',
};

interface NavbarProps {
  user: any;
  onMenuClick: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = React.useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/rates?q=${encodeURIComponent(query.trim())}` : '/rates');
  };

  const logout = () => {
    clearAuth();
    toast({ title: 'Signed out', description: 'See you soon. Fresh rates will be waiting.', variant: 'success' });
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/70 pt-safe">
      <div className="flex h-[68px] items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-7">
        {/* Mobile: menu + logo */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all hover:border-brand-300 active:scale-95 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="md:hidden">
          <Logo to="/dashboard" />
        </div>

        {/* Tablet/desktop: page title */}
        <div className="hidden min-w-0 md:block">
          <h2 className="truncate font-display text-[17px] font-bold leading-tight">
            {PAGE_TITLES[location.pathname] || 'FreshmCalc'}
          </h2>
          <p className="hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
            <MapPin className="h-3 w-3 text-brand-600 dark:text-brand-400" />
            Dubai, UAE wholesale market · Prices in AED
          </p>
        </div>

        {/* Search */}
        <form onSubmit={submitSearch} className="relative mx-auto hidden w-full max-w-md sm:block" role="search">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Dubai rates — pomegranate, chilli…"
            aria-label="Search Dubai market rates"
            className="h-10 w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/80 hover:border-brand-300 focus:border-brand-500 focus:bg-card focus:ring-4 focus:ring-brand-500/15 dark:hover:border-brand-700"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {/* Market pill */}
          <span className="hidden items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1.5 pl-2 pr-3 text-xs font-extrabold text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200 xl:inline-flex">
            <img src="https://flagsapi.com/AE/flat/64.png" alt="" className="h-4 w-4 rounded-full object-cover" loading="lazy" />
            Dubai · AED
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-brand-500" />
            </span>
          </span>

          <ThemeToggle className="hidden sm:flex" />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-brand-300 hover:text-brand-700 active:scale-95 dark:hover:border-brand-700 dark:hover:text-brand-300"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-lime-500 ring-2 ring-card" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-3 py-3">
                <p className="text-sm font-semibold">Dubai rates are publisher-updated</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                  New AED wholesale rates appear as soon as the market team publishes them. Check the freshness time on every rate.
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/rates">View latest Dubai rates</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card py-1 pl-1 pr-2 shadow-sm transition-all hover:border-brand-300 active:scale-[0.98] dark:hover:border-brand-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-700 font-display text-xs font-extrabold text-white">
                  {initials(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email)}
                </span>
                <span className="hidden max-w-[130px] text-left leading-tight lg:block">
                  <span className="block truncate text-[13px] font-bold">{displayName(user)}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Trader account'}
                  </span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-bold">{displayName(user)}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || 'Signed in'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <UserRound /> Profile settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/subscription">
                  <CreditCard /> Subscription & billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings /> Preferences
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40 dark:focus:text-red-300 [&_svg]:text-red-500">
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
