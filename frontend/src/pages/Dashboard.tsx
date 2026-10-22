'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  CalendarClock,
  CircleAlert,
  Crown,
  FileText,
  History,
  Lock,
  Package,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { InstallPrompt } from '@/components/common/InstallPrompt';
import { FreshnessTag, ProductAvatar } from '@/components/common/ProductAvatar';
import { ratesService } from '@/services/rates.service';
import { getAuth } from '@/lib/api';
import { displayName, formatAED, formatDate, timeAgo } from '@/lib/format';
import { hasFeature } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#277f52', '#389d68', '#5fb988', '#95d3ae', '#206644', '#84cc16', '#1c5238', '#65a30d'];

function isDubaiRate(r: any) {
  return (r.country || '').toLowerCase().includes('uae') || (r.city || '').toLowerCase() === 'Dubai';
}

export default function Dashboard() {
  const { user } = getAuth();
  const { data: rates = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: ratesService.listPublished,
  });

  const dubaiRates = React.useMemo(() => {
    const filtered = rates.filter(isDubaiRate);
    return filtered.length > 0 ? filtered : rates;
  }, [rates]);

  const latest = React.useMemo(
    () =>
      [...dubaiRates].sort(
        (a: any, b: any) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
      ),
    [dubaiRates]
  );

  const updatedToday = dubaiRates.filter((r: any) => {
    if (!r.lastUpdated) return false;
    return Date.now() - new Date(r.lastUpdated).getTime() < 24 * 3600_000;
  }).length;

  const chartData = React.useMemo(
    () =>
      [...dubaiRates]
        .filter((r: any) => Number(r.priceAmount) > 0)
        .sort((a: any, b: any) => Number(b.priceAmount) - Number(a.priceAmount))
        .slice(0, 8)
        .map((r: any) => ({
          name: (r.productName || 'Product').split(' ')[0],
          price: Number(r.priceAmount),
          unit: r.pricingUnit || '',
        })),
    [dubaiRates]
  );

  const planEnt = user?.planEntitlements || {};
  const activeSub = user?.activeSubscription;
  const isAdmin = user?.role === 'ADMIN';
  const hasPlan = isAdmin || Boolean(activeSub?.active) || Boolean(planEnt.dubaiRatesAccess);
  const firstName = displayName(user).split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting */}
      <div className="surface-forest relative overflow-hidden rounded-3xl p-6 text-white shadow-soft sm:p-7">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(500px_240px_at_80%_0%,black,transparent)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300/80">{today} · Dubai, UAE</p>
            <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight sm:text-3xl">
              Namaste, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-brand-100/85">
              Here's what's moving in the Dubai wholesale market today. All prices in AED.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
            <Button asChild variant="lime" className="w-full sm:w-auto">
              <Link to="/calculator">
                <Calculator className="h-[18px] w-[18px]" /> New export costing
              </Link>
            </Button>
            <Button asChild className="w-full border border-white/25 bg-white/10 text-white shadow-none backdrop-blur hover:bg-white/20 sm:w-auto">
              <Link to="/rates">
                <TrendingUp className="h-[18px] w-[18px]" /> View live rates
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <InstallPrompt />

      {/* Upgrade strip */}
      {!hasPlan && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold text-amber-900 dark:text-amber-200">Unlock the full Dubai market</p>
            <p className="text-sm leading-relaxed text-amber-800/80 dark:text-amber-200/70">
              You're on a free account. Subscribe to unlock live AED rates, the export calculator and PDF quotations.
            </p>
          </div>
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link to="/subscription">
              View plans from ₹499 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Dubai products tracked"
          value={isLoading ? '…' : String(dubaiRates.length)}
          sub="Published wholesale rates"
        />
        <StatCard
          icon={TrendingUp}
          label="Rates updated (24h)"
          value={isLoading ? '…' : String(updatedToday)}
          sub="Fresh from the market team"
        />
        <StatCard
          icon={CalendarClock}
          label="Last rate update"
          value={isLoading ? '…' : latest[0]?.lastUpdated ? timeAgo(latest[0].lastUpdated) : '—'}
          sub={latest[0]?.productName ? `${latest[0].productName} · Dubai` : 'Dubai, UAE (AED)'}
        />
        <StatCard
          icon={Crown}
          label="Your plan"
          value={isAdmin ? 'Admin' : activeSub?.planName || 'Free'}
          sub={
            isAdmin
              ? 'Full platform access'
              : activeSub?.currentPeriodEnd
                ? `Valid till ${formatDate(activeSub.currentPeriodEnd)}`
                : 'Upgrade for live rates'
          }
          highlight={hasPlan}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Latest rates */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Latest Dubai rates</CardTitle>
              <CardDescription>Publisher-published AED wholesale prices. Never Indian domestic rates.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/rates">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                icon={CircleAlert}
                title="Could not load Dubai rates"
                description="The FreshmCalc server didn't respond. Check your connection and try again."
                action={
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCcw className="h-4 w-4" /> Retry
                  </Button>
                }
              />
            ) : latest.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No Dubai rates published yet"
                description="New AED wholesale rates will appear here as soon as our market team publishes them."
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {latest.slice(0, 6).map((r: any) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-950/50 sm:px-5">
                    <ProductAvatar name={r.productName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{r.productName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[r.variety, r.grade].filter(Boolean).join(' · ') || r.marketName || 'Dubai Wholesale'}
                      </p>
                      <FreshnessTag value={r.lastUpdated} className="mt-0.5 sm:hidden" />
                    </div>
                    <div className="hidden text-right sm:block">
                      <FreshnessTag value={r.lastUpdated} />
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{r.marketName || 'Dubai'}, UAE</p>
                    </div>
                    <div className="w-[118px] shrink-0 text-right">
                      <p className="font-mono text-[15px] font-semibold">{formatAED(Number(r.priceAmount), Number(r.priceAmount) % 1 === 0 ? 0 : 2)}</p>
                      <p className="text-[11px] text-muted-foreground">{r.pricingUnit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="flex flex-col gap-5">
          <Card className={cn('overflow-hidden', hasPlan && 'surface-forest border-transparent text-white')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Subscription</CardTitle>
                <Badge variant={hasPlan ? 'success' : 'warn'} className={cn(hasPlan && 'border-lime-300/30 bg-lime-400/15 text-lime-200')}>
                  {hasPlan ? 'Active' : 'Free'}
                </Badge>
              </div>
              <CardDescription className={cn(hasPlan && 'text-brand-100/75')}>
                {isAdmin ? 'Administrator — full access' : activeSub?.planName ? `${activeSub.planName} plan` : 'No active plan yet'}
                {activeSub?.currentPeriodEnd ? ` · till ${formatDate(activeSub.currentPeriodEnd)}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                {(
                  [
                    ['dubaiRatesAccess', 'Live Dubai rates (AED)'],
                    ['calculatorAccess', 'Export cost calculator'],
                    ['pdfExportAccess', 'PDF quotations'],
                    ['savedCalculationsAccess', 'Saved cost sheets'],
                  ] as const
                ).map(([key, label]) => {
                  const included = isAdmin || Boolean(planEnt[key]);
                  return (
                    <li key={key} className="flex items-center justify-between gap-2">
                      <span className={cn(hasPlan ? 'text-brand-50' : '')}>{label}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide',
                          included
                            ? hasPlan
                              ? 'bg-lime-400/20 text-lime-200'
                              : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {included ? 'Included' : 'Locked'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Button asChild variant={hasPlan ? 'lime' : 'default'} className="mt-5 w-full">
                <Link to="/subscription">{hasPlan ? 'Manage subscription' : 'Upgrade now'}</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-3">
            <QuickAction icon={Calculator} label="Calculator" href="/calculator" allowed={hasFeature(user, 'calculatorAccess')} />
            <QuickAction icon={FileText} label="Cost sheets" href="/calculations" allowed={hasFeature(user, 'savedCalculationsAccess')} />
            <QuickAction icon={History} label="History" href="/rates/history" allowed={hasFeature(user, 'dubaiRatesAccess')} />
          </div>
        </div>
      </div>

      {/* Price chart */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Dubai price snapshot</CardTitle>
            <CardDescription>Highest-priced published products right now (AED per pricing unit).</CardDescription>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200 sm:inline-flex">
            <Wallet className="h-3.5 w-3.5" /> AED
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : chartData.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No price data yet" description="The chart will populate as soon as Dubai rates are published." className="py-8" />
          ) : (
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }} dy={6} interval={0} angle={chartData.length > 5 ? -18 : 0} textAnchor={chartData.length > 5 ? 'end' : 'middle'} height={44} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }} />
                  <Tooltip
                    formatter={(v: number, _n, p: any) => [`AED ${v.toFixed(2)} (${p?.payload?.unit || ''})`, 'Price']}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 13 }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                  />
                  <Bar dataKey="price" radius={[8, 8, 0, 0]} maxBarSize={52}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Card className="group p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            highlight ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white' : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 truncate font-display text-[22px] font-extrabold leading-none sm:text-[26px]">{value}</p>
      <p className="mt-1.5 truncate text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, href, allowed }: { icon: React.ElementType; label: string; href: string; allowed: boolean }) {
  return (
    <Link
      to={allowed ? href : '/subscription'}
      title={allowed ? label : `${label} — requires an active plan`}
      className={cn(
        'group relative flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card p-3 text-center shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700',
        !allowed && 'opacity-70'
      )}
    >
      {!allowed && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <Lock className="h-3 w-3" />
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition-transform duration-300 group-hover:scale-110 dark:bg-brand-900 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[13px] font-bold leading-tight">{label}</span>
    </Link>
  );
}
