'use client';

import * as React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function MainLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const userRaw = localStorage.getItem('freshmcalc_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const navigate = useNavigate();

  const publicPaths = ['/login', '/register', '/pricing', '/'];
  if (publicPaths.includes(window.location.pathname)) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} user={user} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn('flex-1 flex flex-col overflow-hidden', collapsed ? 'ml-16' : 'ml-64')}>
        <Navbar user={user} onToggle={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
