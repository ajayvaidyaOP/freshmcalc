'use client';

import * as React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, Shirt, Settings, Users, ShieldAlert,
  BarChart3, CreditCard, LogOut, ChevronLeft, ChevronRight, Menu, X, FileText, ShoppingCart, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  planFeature?: 'dubaiRatesAccess' | 'calculatorAccess' | 'pdfExportAccess' | 'savedCalculationsAccess';
}

const SIDEBAR_ITEMS: NavItem[] = [
  { label: 'Dubai Market Overview', href: '/dashboard', icon: Globe },
  { label: 'Latest Dubai Rates', href: '/rates', icon: Shirt, planFeature: 'dubaiRatesAccess' },
  { label: 'Price History', href: '/rates/history', icon: BarChart3, planFeature: 'dubaiRatesAccess' },
  { label: 'Export Calculator', href: '/calculator', icon: CreditCard, planFeature: 'calculatorAccess' },
  { label: 'Saved Cost Sheets', href: '/calculations', icon: FileText, planFeature: 'savedCalculationsAccess' },
  { label: 'Subscription & Payments', href: '/subscription', icon: DollarSign },
  { label: 'Account Settings', href: '/settings', icon: Settings },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Admin Dashboard', href: '/admin', icon: ShieldAlert, adminOnly: true },
  { label: 'Manage Market Rates', href: '/admin/rates', icon: Shirt, adminOnly: true },
  { label: 'Products & Varieties', href: '/admin/products', icon: ShoppingCart, adminOnly: true },
  { label: 'Ports & Routes', href: '/admin/ports', icon: Globe, adminOnly: true },
  { label: 'Users & Subscriptions', href: '/admin/users', icon: Users, adminOnly: true },
];

function hasFeature(user: any, feature?: string): boolean {
  if (!feature) return true;
  if (user?.role === 'ADMIN') return true;
  const plan = user?.planEntitlements || {};
  return Boolean(plan[feature]);
}

export function Sidebar({ collapsed, user, onToggle }: { collapsed: boolean; user: any; onToggle: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;

  const renderMarketItem = (item: NavItem) => {
    const active = location.pathname === item.href;
    const allowed = hasFeature(user, item.planFeature);
    const base = 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors';
    if (!allowed) {
      return (
        <span key={item.href} className={cn(base, 'opacity-40 cursor-not-allowed')}>
          <item.icon size={16} />
          {!collapsed && <span className="font-medium">{item.label}</span>}
          {!collapsed && <span className="ml-auto text-xs text-muted-foreground">Paid plan</span>}
        </span>
      );
    }
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => navigate(item.href)}
        className={cn(base, active && 'bg-primary text-primary-foreground', !active && 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}
      >
        <item.icon size={16} />
        {!collapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  const renderAdminItem = (item: NavItem) => {
    const active = location.pathname === item.href;
    const admin = role === 'ADMIN';
    const base = 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors';
    if (!admin) {
      return (
        <span key={item.href} className={cn(base, 'opacity-40 cursor-not-allowed')}>
          <item.icon size={16} />
          {!collapsed && <span className="font-medium">{item.label}</span>}
        </span>
      );
    }
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => navigate(item.href)}
        className={cn(base, active && 'bg-primary text-primary-foreground', 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}
      >
        <item.icon size={16} />
        {!collapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn('fixed left-0 top-0 h-screen bg-border border-r z-50 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-14 items-center justify-between border-b border-input px-4 bg-background">
        {!collapsed && (
          <>
            <span className="text-xl font-bold tracking-tight text-primary">FreshmCalc</span>
            <button onClick={onToggle} className="ml-auto p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </>
        )}
        {collapsed && (
          <button onClick={onToggle} className="p-2 text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
        )}
      </div>

      <nav className="flex h-full flex-col overflow-y-auto space-y-1 px-2 py-4">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {collapsed ? <ChevronLeft size={14} /> : 'Marketplace'}
        </div>
        {SIDEBAR_ITEMS.map((item) => renderMarketItem(item))}

        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Administration
        </div>
        {ADMIN_ITEMS.map((item) => renderAdminItem(item))}

        <div className="mt-auto px-3 py-4">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={16} />
            {!collapsed && <span className="font-medium">Sign out</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
