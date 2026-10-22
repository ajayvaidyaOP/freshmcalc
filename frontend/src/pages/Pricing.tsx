'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/components/common/Reveal';
import { subscriptionsService } from '@/services/subscriptions.service';
import { FALLBACK_PLANS } from '@/lib/sample-data';
import { formatPaise } from '@/lib/format';
import { getAuth } from '@/lib/api';
import { isNativeApp } from '@/lib/platform';
import { cn } from '@/lib/utils';

const PLAN_FEATURES = [
  { key: 'dubaiRatesAccess', label: 'Live Dubai market rates (AED)' },
  { key: 'calculatorAccess', label: 'India → Dubai export calculator' },
  { key: 'pdfExportAccess', label: 'PDF quotations for buyers' },
  { key: 'savedCalculationsAccess', label: 'Unlimited saved cost sheets' },
] as const;

const INCLUDED_EVERYWHERE = [
  'Published price history & trends',
  'Ports, routes & freight reference',
  'Mobile, tablet & desktop access',
  'Email support (Mon–Sat)',
];

function monthsOf(cycle?: string) {
  if (cycle === 'QUARTERLY') return 3;
  if (cycle === 'YEARLY') return 12;
  return 1;
}

export default function Pricing() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['plans'], queryFn: subscriptionsService.listPlans });
  const { token } = getAuth();
  const native = isNativeApp();
  const usingFallback = isError || !data || data.length === 0;
  const plans = usingFallback && !isLoading ? FALLBACK_PLANS : data || [];
  const ctaTo = native ? (token ? '/subscription' : '/login') : (token ? '/subscription' : '/register');

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-800/25" />

      <section className="container relative pb-8 pt-12 text-center sm:pt-16">
        <Reveal>
          <Badge variant="soft" className="normal-case tracking-normal">
            <Sparkles className="h-3.5 w-3.5" /> All plans include every feature
          </Badge>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Simple pricing for <span className="text-gradient">serious exporters</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            No per-shipment fees. No hidden charges. Just live Dubai AED rates and complete export costing for one flat price.
          </p>
        </Reveal>
      </section>

      <section className="container relative pb-16 sm:pb-20">
        {isLoading ? (
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[460px] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl items-stretch gap-5 md:grid-cols-3">
            {plans.map((plan: any, i: number) => {
              const popular = plan.name === 'Quarterly';
              const months = monthsOf(plan.billingCycle);
              const perMonth = Math.round((plan.priceAmount || 0) / months);
              const saving = plan.billingCycle === 'YEARLY' ? 'Save 17%' : plan.billingCycle === 'QUARTERLY' ? 'Save 13%' : null;
              return (
                <Reveal key={plan.id} delay={i * 100} className="h-full">
                  <article
                    className={cn(
                      'relative flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8',
                      popular
                        ? 'surface-forest text-white shadow-glow ring-1 ring-brand-400/40 md:-my-3 md:py-11'
                        : 'border border-border/80 bg-card shadow-soft hover:shadow-lift'
                    )}
                  >
                    {popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-lime-400 px-3 py-1 text-brand-950 shadow-soft">
                        Most popular
                      </Badge>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-lg font-bold">{plan.name} plan</h2>
                      {saving && (
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-extrabold', popular ? 'bg-lime-400/20 text-lime-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200')}>
                          <BadgePercent className="h-3.5 w-3.5" /> {saving}
                        </span>
                      )}
                    </div>
                    <p className={cn('mt-1.5 min-h-[40px] text-sm leading-relaxed', popular ? 'text-brand-100/80' : 'text-muted-foreground')}>
                      {plan.description}
                    </p>

                    <p className="mt-4">
                      <span className="font-display text-[44px] font-extrabold leading-none">{formatPaise(plan.priceAmount)}</span>
                      <span className={cn('ml-1.5 text-sm font-semibold', popular ? 'text-brand-200/80' : 'text-muted-foreground')}>
                        / {months === 1 ? 'month' : `${months} months`}
                      </span>
                    </p>
                    <p className={cn('mt-1.5 text-[13px] font-bold', popular ? 'text-lime-300' : 'text-brand-600 dark:text-brand-400')}>
                      That's just {formatPaise(perMonth)} per month
                    </p>

                    <ul className="mt-6 flex-1 space-y-2.5 border-t border-dashed pt-6 text-sm [border-color:hsl(var(--border))]">
                      {PLAN_FEATURES.map((f) => {
                        const included = plan[f.key] !== false;
                        return (
                          <li key={f.key} className={cn('flex items-start gap-2.5', !included && 'opacity-45')}>
                            <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', popular ? 'bg-lime-400 text-brand-950' : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300')}>
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span>{f.label}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <Button asChild variant={popular ? 'lime' : 'default'} size="lg" className="mt-7 w-full" disabled={!plan.active}>
                      <Link to={ctaTo}>
                        {native ? (token ? 'View plan status' : 'Sign in') : (token ? 'Subscribe now' : 'Get started')} <ArrowRight className="h-[18px] w-[18px]" />
                      </Link>
                    </Button>
                    <p className={cn('mt-3 text-center text-xs', popular ? 'text-brand-200/70' : 'text-muted-foreground')}>
                      Billed in INR · GST invoice available
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {usingFallback && !isLoading && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Showing standard plan pricing. Live plan catalogue loads when the FreshmCalc server is connected.
          </p>
        )}

        {/* Included strip */}
        <Reveal className="mx-auto mt-14 max-w-6xl">
          <div className="grid gap-6 rounded-3xl border border-border/80 bg-card p-7 shadow-soft sm:p-9 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="font-display text-xl font-bold">Every plan also includes</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                One subscription works across your phone, tablet and office desktop — your cost sheets stay in sync everywhere.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4 dark:bg-brand-950">
                <ShieldCheck className="h-8 w-8 shrink-0 text-brand-600 dark:text-brand-400" strokeWidth={1.6} />
                <p className="text-sm leading-snug">
                  <strong>Secure payments via Razorpay</strong>
                  <br />
                  <span className="text-muted-foreground">UPI, cards & net-banking on the web. Fixed-term access with no automatic renewal.</span>
                </p>
              </div>
            </div>
            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {INCLUDED_EVERYWHERE.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm sm:col-span-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  <CreditCard className="h-3 w-3" strokeWidth={2.5} />
                </span>
                Need a team or enterprise plan for your trading house? Mail us at support@freshmcalc.com.
              </li>
            </ul>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
