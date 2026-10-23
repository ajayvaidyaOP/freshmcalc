'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, CalendarClock, Check, Crown, Info, Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { subscriptionsService } from '@/services/subscriptions.service';
import { paymentsService } from '@/services/payments.service';
import { formatDate, formatPaise } from '@/lib/format';
import { apiError, getAuth, refreshUser } from '@/lib/api';
import { isDemoMode } from '@/lib/demo';
import { isNativeApp } from '@/lib/platform';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FEATURE_LABELS: Array<[string, string]> = [
  ['dubaiRatesAccess', 'Dubai market rates (AED)'],
  ['calculatorAccess', 'Export cost calculator'],
  ['pdfExportAccess', 'PDF quotations'],
  ['savedCalculationsAccess', 'Saved cost sheets'],
];

function monthsOf(cycle?: string) {
  if (cycle === 'QUARTERLY') return 3;
  if (cycle === 'YEARLY') return 12;
  return 1;
}

/** Razorpay's checkout script is loaded only when the user starts a payment. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscription() {
  const plansQuery = useQuery({ queryKey: ['plans'], queryFn: subscriptionsService.listPlans });
  const subQuery = useQuery({ queryKey: ['subscription'], queryFn: subscriptionsService.getActive, retry: false });
  const [subscribingId, setSubscribingId] = React.useState<number | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const native = isNativeApp();

  const plans = plansQuery.data || [];
  const subscription = subQuery.data;
  const subActive = Boolean(subscription?.active);

  const daysLeft = React.useMemo(() => {
    if (!subscription?.currentPeriodEnd) return null;
    const diff = new Date(subscription.currentPeriodEnd).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }, [subscription]);

  const progress = React.useMemo(() => {
    if (!subscription?.currentPeriodStart || !subscription?.currentPeriodEnd) return null;
    const start = new Date(subscription.currentPeriodStart).getTime();
    const end = new Date(subscription.currentPeriodEnd).getTime();
    if (end <= start) return null;
    return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  }, [subscription]);

  const subscribe = async (plan: any) => {
    if (isDemoMode()) {
      toast({
        title: 'Demo mode',
        description: 'Payments are disabled in the demo — every feature is already unlocked for exploring.',
      });
      return;
    }
    if (native) {
      toast({
        title: 'Manage your plan on the web',
        description:
          'Store in-app purchases are not enabled in this build. Open freshmcalc.com in your browser to subscribe or renew.',
      });
      return;
    }

    setSubscribingId(plan.id);
    try {
      const order = await paymentsService.createOrder(plan.id);
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error('The payment window could not load. Please check your connection and try again.');
      }

      const user = getAuth().user;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'FreshmCalc',
        description: `${plan.name} subscription`,
        order_id: order.orderId,
        prefill: { email: user?.email || '', contact: user?.phone || '' },
        notes: { planId: String(plan.id), source: 'web' },
        theme: { color: '#206644' },
        handler: async (response: any) => {
          setVerifying(true);
          try {
            await paymentsService.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast({
              title: `${plan.name} plan activated`,
              description: 'Payment verified. Your Dubai rates and calculator are unlocked.',
              variant: 'success',
            });
            await refreshUser();
            await subQuery.refetch();
          } catch (e: any) {
            toast({
              title: 'Payment received, activation pending',
              description: apiError(e, 'If the plan does not activate in a minute, contact support@freshmcalc.com with your payment id.'),
              variant: 'destructive',
            });
          } finally {
            setVerifying(false);
            setSubscribingId(null);
          }
        },
        modal: {
          ondismiss: () => setSubscribingId(null),
        },
      });

      checkout.on('payment.failed', (response: any) => {
        setSubscribingId(null);
        toast({
          title: 'Payment failed',
          description: response?.error?.description || 'Razorpay declined the payment. No money was deducted.',
          variant: 'destructive',
        });
      });

      checkout.open();
    } catch (e: any) {
      setSubscribingId(null);
      toast({
        title: 'Checkout could not start',
        description: apiError(e, 'Payment configuration may be required. Please contact support@freshmcalc.com.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Subscription & Payments"
        description="Manage your FreshmCalc plan. Payments are processed securely in INR via Razorpay."
      />

      {/* Current plan hero */}
      {subQuery.isLoading ? (
        <Skeleton className="h-[190px] rounded-3xl" />
      ) : (
        <div className={cn('relative overflow-hidden rounded-3xl p-6 shadow-soft sm:p-7', subActive ? 'surface-forest text-white' : 'border border-border/80 bg-card')}>
          {subActive && <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(480px_220px_at_85%_0%,black,transparent)]" />}
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', subActive ? 'bg-lime-400 text-brand-950' : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300')}>
                <Crown className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold">
                    {subActive ? `${subscription.planName} plan` : 'Free account'}
                  </h2>
                  <Badge variant={subActive ? 'success' : 'warn'} className={cn(subActive && 'border-lime-300/30 bg-lime-400/15 text-lime-200')}>
                    {subActive ? 'Active' : 'Not subscribed'}
                  </Badge>
                </div>
                <p className={cn('mt-1 max-w-md text-sm leading-relaxed', subActive ? 'text-brand-100/85' : 'text-muted-foreground')}>
                  {subActive
                    ? `Full access to Dubai AED rates, the export calculator and PDF quotations${subscription.currentPeriodEnd ? ` until ${formatDate(subscription.currentPeriodEnd)}` : ''}.`
                    : 'Subscribe to unlock Dubai market rates in AED, the India → Dubai export calculator, saved cost sheets and PDF quotations.'}
                </p>
                {subActive && progress !== null && (
                  <div className="mt-4 max-w-md">
                    <div className="h-2 overflow-hidden rounded-full bg-white/15" aria-hidden>
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-lime-300 transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-200/85">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in this period` : 'Current billing period'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {!subActive && !native && (
              <Button asChild size="lg" className="w-full shrink-0 md:w-auto">
                <a href="#plans">Choose a plan <ArrowRight className="h-[18px] w-[18px]" /></a>
              </Button>
            )}
          </div>
        </div>
      )}

      {native && (
        <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
          <div className="text-[13px] leading-relaxed">
            <p className="font-bold">Your subscription works here</p>
            <p className="mt-0.5 text-muted-foreground">
              Signing in with your existing FreshmCalc account unlocks the same rates, calculator and saved sheets on
              this device. This version does not sell subscriptions in-app; our team can help with any plan change at{' '}
              <a href="mailto:support@freshmcalc.com" className="font-semibold text-foreground underline underline-offset-4">
                support@freshmcalc.com
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Plans — web only. App Store/Play rules: no in-app purchase CTA in the
          native shells until real IAP (StoreKit 2 / Play Billing) is wired. */}
      <div id="plans" className={cn('scroll-mt-24', native && 'hidden')}>
        <h2 className="mb-4 font-display text-lg font-bold">{subActive ? 'Switch or renew' : 'Available plans'}</h2>
        {plansQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[340px] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan: any) => {
              const months = monthsOf(plan.billingCycle);
              const isCurrent = subActive && subscription?.planName === plan.name;
              const popular = plan.name === 'Quarterly';
              const saving = plan.billingCycle === 'YEARLY' ? 'Save 17%' : plan.billingCycle === 'QUARTERLY' ? 'Save 13%' : null;
              return (
                <article
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 sm:p-7',
                    popular
                      ? 'surface-forest text-white shadow-glow ring-1 ring-brand-400/40'
                      : 'border border-border/80 bg-card shadow-soft hover:shadow-lift',
                    isCurrent && 'ring-2 ring-brand-500'
                  )}
                >
                  {popular && !isCurrent && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-lime-400 text-brand-950">Most popular</Badge>}
                  {isCurrent && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-brand-600 text-white">Current plan</Badge>}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold">{plan.name}</h3>
                    {saving && (
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-extrabold', popular ? 'bg-lime-400/20 text-lime-300' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200')}>
                        <BadgePercent className="h-3.5 w-3.5" /> {saving}
                      </span>
                    )}
                  </div>
                  <p className="mt-3">
                    <span className="font-display text-4xl font-extrabold">{formatPaise(plan.priceAmount)}</span>
                    <span className={cn('ml-1 text-sm font-semibold', popular ? 'text-brand-200/80' : 'text-muted-foreground')}>
                      / {months === 1 ? 'month' : `${months} months`}
                    </span>
                  </p>
                  <p className={cn('mt-1 text-[13px] font-bold', popular ? 'text-lime-300' : 'text-brand-600 dark:text-brand-400')}>
                    ≈ {formatPaise(Math.round((plan.priceAmount || 0) / months))} / month
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 border-t border-dashed pt-5 text-sm [border-color:hsl(var(--border))]">
                    {FEATURE_LABELS.map(([key, label]) => {
                      const included = (plan as any)[key] !== false;
                      return (
                        <li key={key} className={cn('flex items-center gap-2', !included && 'opacity-45')}>
                          <Check className={cn('h-4 w-4 shrink-0', popular ? 'text-lime-300' : 'text-brand-600 dark:text-brand-400')} strokeWidth={3} />
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    variant={popular ? 'lime' : 'default'}
                    size="lg"
                    className="mt-6 w-full"
                    disabled={!plan.active || isCurrent || subscribingId === plan.id || verifying}
                    onClick={() => subscribe(plan)}
                  >
                    {verifying && subscribingId === plan.id ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Verifying payment…</>
                    ) : subscribingId === plan.id ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Starting checkout…</>
                    ) : isCurrent ? (
                      'Current plan'
                    ) : subActive ? (
                      `Switch to ${plan.name}`
                    ) : (
                      `Subscribe — ${plan.name}`
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
        {!plansQuery.isLoading && (plansQuery.isError || plans.length === 0) && (
          <Card className="mt-3">
            <CardContent className="flex flex-col items-start gap-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">The live plan catalogue is unavailable, so checkout is disabled. No fallback plan can be purchased.</p>
              <Button variant="outline" size="sm" onClick={() => plansQuery.refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">Secure Razorpay payments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Pay with UPI, debit/credit cards or net-banking. FreshmCalc never stores your card details. The plan
            activates only after the server verifies Razorpay's payment signature — a browser redirect alone never
            unlocks access.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <Info className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">Good to know</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Plans are fixed-term access with no automatic renewal or auto-debit; buy a new term when you want to renew.
            If checkout doesn't open, payments may still be in configuration mode — write to support@freshmcalc.com with your account email.
            {' '}See the <Link to="/pricing" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">pricing page</Link> for a full feature comparison.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
