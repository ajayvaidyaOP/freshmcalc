'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleAlert, Clock3, Package, ShieldCheck, Ship, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { ratesService } from '@/services/rates.service';
import { productsService } from '@/services/products.service';
import { portsService } from '@/services/ports.service';
import { timeAgo } from '@/lib/format';

export default function AdminDashboard() {
  const ratesQ = useQuery({ queryKey: ['rates'], queryFn: ratesService.listPublished });
  const productsQ = useQuery({ queryKey: ['products'], queryFn: productsService.listProducts });
  const portsQ = useQuery({ queryKey: ['ports'], queryFn: portsService.listPorts });

  const rates = ratesQ.data || [];
  const now = Date.now();
  const stale = rates.filter((r: any) => r.lastUpdated && now - new Date(r.lastUpdated).getTime() > 72 * 3600_000).length;
  const today = rates.filter((r: any) => r.lastUpdated && now - new Date(r.lastUpdated).getTime() < 24 * 3600_000).length;
  const lastUpdated = rates
    .map((r: any) => r.lastUpdated)
    .filter(Boolean)
    .sort()
    .pop();

  const stats = [
    { label: 'Dubai rates published', value: ratesQ.isLoading ? '…' : String(rates.length), icon: TrendingUp },
    { label: 'Updated in last 24h', value: ratesQ.isLoading ? '…' : String(today), icon: Clock3 },
    { label: 'Stale rates (>72h)', value: ratesQ.isLoading ? '…' : String(stale), icon: CircleAlert, danger: stale > 0 },
    { label: 'Products in catalogue', value: productsQ.isLoading ? '…' : String((productsQ.data || []).length), icon: Package },
  ];

  const modules = [
    {
      title: 'Dubai Market Rates',
      desc: 'Publish and manage AED wholesale rates. Mark outdated prices stale.',
      icon: TrendingUp,
      href: '/admin/rates',
      meta: lastUpdated ? `Last publish ${timeAgo(lastUpdated).toLowerCase()}` : 'No rates yet',
    },
    {
      title: 'Products & Varieties',
      desc: 'Maintain the produce catalogue, grades and default packing units.',
      icon: Package,
      href: '/admin/products',
      meta: `${(productsQ.data || []).length} products`,
    },
    {
      title: 'Ports & Routes',
      desc: 'Indian origin ports, Jebel Ali routes, transit times and freight quotes.',
      icon: Ship,
      href: '/admin/ports',
      meta: `${(portsQ.data || []).length} ports`,
    },
    {
      title: 'Users & Subscriptions',
      desc: 'Customer accounts, roles, plan status and entitlements.',
      icon: Users,
      href: '/admin/users',
      meta: 'Role-based access',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Manage Dubai market rates, the product catalogue, ports, routes and customers."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="group p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <span
                className={
                  s.danger
                    ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300'
                    : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                }
              >
                <s.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-2 font-display text-[26px] font-extrabold leading-none">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            to={m.href}
            className="group flex items-start gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft transition-transform duration-300 group-hover:scale-110">
              <m.icon className="h-6 w-6" strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-base font-bold">{m.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{m.desc}</span>
              <span className="mt-2.5 inline-block rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                {m.meta}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed dark:border-brand-800 dark:bg-brand-950/60 sm:p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
        <p className="text-brand-900 dark:text-brand-100">
          <strong>Publishing rule:</strong> every rate shown to customers is a Dubai, UAE price in AED with its source
          and timestamp. Indian domestic prices must never be published as Dubai rates.
        </p>
      </div>
    </div>
  );
}
