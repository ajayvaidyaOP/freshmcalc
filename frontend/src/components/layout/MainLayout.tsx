'use client';

import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getAuth } from '@/lib/api';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { DemoBanner } from './DemoBanner';

/**
 * Responsive app shell:
 * - Phone  (<768px)   : top bar + slide-over drawer + bottom navigation
 * - Tablet (768–1279) : 76px icon rail
 * - Desktop (>1280)   : 264px sidebar, collapsible to a rail
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const { user } = getAuth();

  // Close the drawer whenever the route changes; lock body scroll while open.
  React.useEffect(() => setMobileOpen(false), [location.pathname]);
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Tablet rail + desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 hidden transition-[width] duration-300 md:block md:w-[76px]',
          collapsed ? 'xl:w-[76px]' : 'xl:w-[264px]'
        )}
      >
        <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 h-full w-full bg-brand-950/60 backdrop-blur-sm animate-fade-in"
          />
          <aside className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px] shadow-lift animate-slide-in-left">
            <Sidebar
              user={user}
              collapsed={false}
              variant="drawer"
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className={cn('flex min-h-dvh flex-col transition-[margin] duration-300 md:ml-[76px]', collapsed ? 'xl:ml-[76px]' : 'xl:ml-[264px]')}>
        <Navbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-5 animate-fade-up sm:px-6 sm:pt-6 md:pb-10 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
        <footer className="hidden border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground md:block lg:px-8">
          FreshmCalc · Dubai, UAE wholesale rates (AED) — India is the sourcing origin. Indian domestic prices are never shown as Dubai rates.
        </footer>
      </div>

      <MobileNav />
      <DemoBanner />
    </div>
  );
}
