'use client';

import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogOut, PanelLeftClose, PanelLeftOpen, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo, LogoMark } from '@/components/common/Logo';
import { clearAuth } from '@/lib/api';
import { displayName, initials } from '@/lib/format';
import { ACCOUNT_ITEMS, ADMIN_ITEMS, MARKET_ITEMS, hasFeature, isActivePath, type NavItem } from './nav-items';
import { toast } from '@/hooks/use-toast';

interface SidebarProps {
  user: any;
  collapsed: boolean;
  onToggle: () => void;
  /** 'drawer' = full-width mobile slide-over (labels always visible). */
  variant?: 'rail' | 'drawer';
  onNavigate?: () => void;
}

export function Sidebar({ user, collapsed, onToggle, variant = 'rail', onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const showLabels = variant === 'drawer' || !collapsed;
  // On tablet (md–xl) the rail is icon-only; labels appear at xl unless collapsed.
  const labelClass = variant === 'drawer' ? 'inline' : collapsed ? 'hidden' : 'hidden xl:inline';
  const sectionClass = variant === 'drawer' ? 'block' : collapsed ? 'hidden' : 'hidden xl:block';

  const logout = () => {
    clearAuth();
    toast({ title: 'Signed out', description: 'See you soon. Fresh rates will be waiting.', variant: 'success' });
    navigate('/login');
  };

  const renderItem = (item: NavItem) => {
    const active = isActivePath(location.pathname, item.href);
    const allowed = hasFeature(user, item.planFeature);
    const base = cn(
      'group relative flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
      !showLabels && variant === 'rail' && 'justify-center xl:justify-center',
      variant === 'rail' && !collapsed && 'max-xl:justify-center'
    );

    if (!allowed) {
      return (
        <Link
          key={item.href}
          to="/subscription"
          onClick={onNavigate}
          title={`${item.label} — requires an active plan`}
          className={cn(base, 'text-brand-100/45 hover:bg-white/5 hover:text-brand-100/70')}
        >
          <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className={cn('flex-1 truncate', labelClass)}>{item.label}</span>
          <span className={cn('items-center gap-1 rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-lime-300', labelClass === 'inline' ? 'inline-flex' : 'hidden xl:inline-flex', collapsed && variant === 'rail' && 'xl:hidden')}>
            <Lock className="h-3 w-3" /> Pro
          </span>
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={onNavigate}
        title={item.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          base,
          active
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-soft ring-1 ring-white/15'
            : 'text-brand-100/75 hover:bg-white/[0.07] hover:text-white'
        )}
      >
        {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-lime-300" />}
        <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
        <span className={cn('flex-1 truncate', labelClass)}>{item.label}</span>
      </Link>
    );
  };

  const sectionTitle = (text: string) => (
    <p className={cn('px-3 pb-1.5 pt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-300/60 first:pt-1', sectionClass)}>
      {text}
    </p>
  );

  const hasActivePlan = isAdmin || Boolean(user?.activeSubscription?.active) || Boolean(user?.planEntitlements?.dubaiRatesAccess);

  return (
    <div className="surface-forest flex h-full flex-col text-white">
      {/* Brand row */}
      <div className="flex h-[68px] items-center gap-2 border-b border-white/10 px-4">
        {variant === 'drawer' || !collapsed ? (
          <span className={cn(variant === 'rail' && 'max-xl:hidden')}>
            <Logo to="/dashboard" tone="light" />
          </span>
        ) : null}
        {variant === 'rail' && (
          <span className={cn('mx-auto', !collapsed && 'xl:hidden')}>
            <LogoMark />
          </span>
        )}
        {variant === 'drawer' ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-brand-100/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto hidden h-9 w-9 items-center justify-center rounded-lg text-brand-100/70 transition-colors hover:bg-white/10 hover:text-white xl:flex"
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {sectionTitle('Marketplace')}
        <div className="space-y-1">{MARKET_ITEMS.map(renderItem)}</div>

        {sectionTitle('Account')}
        <div className="space-y-1">{ACCOUNT_ITEMS.map(renderItem)}</div>

        {isAdmin && (
          <>
            {sectionTitle('Administration')}
            <div className="space-y-1">{ADMIN_ITEMS.map(renderItem)}</div>
          </>
        )}

        {/* Upgrade card */}
        {!hasActivePlan && (
          <div className={cn('mt-6', sectionClass)}>
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 ring-1 ring-white/15">
              <Sparkles className="mb-2 h-5 w-5 text-lime-300" />
              <p className="font-display text-sm font-bold leading-snug">Unlock live Dubai rates</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-100/85">
                Get AED wholesale rates, the export calculator and PDF quotations.
              </p>
              <Link
                to="/subscription"
                onClick={onNavigate}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-lime-400 text-[13px] font-extrabold text-brand-950 transition-all hover:bg-lime-300 active:scale-[0.98]"
              >
                View plans
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className={cn('flex items-center gap-3 rounded-xl px-2 py-2', variant === 'rail' && (collapsed ? 'justify-center' : 'max-xl:justify-center'))}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 to-brand-400 font-display text-[13px] font-extrabold text-brand-950 ring-2 ring-white/20">
            {initials(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email)}
          </span>
          <span className={cn('min-w-0 flex-1', labelClass)}>
            <span className="block truncate text-sm font-bold leading-tight">{displayName(user)}</span>
            <span className="block truncate text-xs text-brand-200/70">
              {isAdmin ? 'Administrator' : user?.activeSubscription?.planName ? `${user.activeSubscription.planName} plan` : 'Free account'}
            </span>
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-100/70 transition-colors hover:bg-red-500/15 hover:text-red-300', variant === 'rail' && !collapsed && 'max-xl:hidden', collapsed && 'hidden')}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
