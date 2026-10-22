'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Apple, CheckCircle2, Download, ExternalLink, Monitor, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { InstallPrompt } from '@/components/common/InstallPrompt';
import { isNativeApp, isStandalone, platformLabel } from '@/lib/platform';
import { cn } from '@/lib/utils';

const FEATURES = [
  'Live Dubai wholesale rates in AED',
  'Export calculator with CHA, freight & commission',
  'Saved cost sheets and PDF quotations',
  'Works offline for the app shell — your draft is kept on the device',
];

/**
 * “Get the app” page. Shows the honest current state: installable PWA today,
 * store listings once the signed builds are published. The InstallPrompt
 * handles the actual installation flow per platform.
 */
export default function GetApp() {
  const native = isNativeApp();
  const installed = isStandalone() || native;

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="FreshmCalc app"
        title="Carry the Dubai market in your pocket"
        description="Rates, costing and quotations on your phone — without opening a laptop at the mandi."
      />

      <div className="surface-forest relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8">
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(520px_260px_at_85%_0%,black,transparent)]"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src="/icons/icon-192.png"
            alt="FreshmCalc app icon"
            width={88}
            height={88}
            className="h-[88px] w-[88px] shrink-0 rounded-3xl shadow-lift ring-1 ring-white/20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-extrabold sm:text-2xl">FreshmCalc</h2>
              <Badge className="border-lime-300/30 bg-lime-400/15 text-lime-200">
                {native ? 'App build' : installed ? 'Installed' : 'Free to install'}
              </Badge>
            </div>
            <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-brand-100/85">
              {installed
                ? `You're using the ${platformLabel().toLowerCase()}. Everything below is already included — nothing extra to download.`
                : 'Install straight from your browser in a few seconds. No app store account needed, and you get updates automatically.'}
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[12.5px] leading-snug text-brand-100/85">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-300" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {!installed && <InstallPrompt />}

      <div className="grid gap-4 sm:grid-cols-3">
        <PlatformCard
          icon={Smartphone}
          title="Android"
          status="Install prompt"
          body="Chrome, Edge or Samsung Internet shows an Install button. The Play Store listing uses the same app in a native shell."
          tone="ready"
        />
        <PlatformCard
          icon={Apple}
          title="iPhone / iPad"
          status="Add to Home Screen"
          body="Open freshmcalc.com in Safari → Share → Add to Home Screen. The App Store listing ships the identical interface."
          tone="ready"
        />
        <PlatformCard
          icon={Monitor}
          title="Desktop"
          status="Install from browser"
          body="Chrome and Edge can install FreshmCalc as a desktop window — handy for quotation work at the office."
          tone="ready"
        />
      </div>

      <Card>
        <CardContent className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h3 className="font-display text-[15px] font-bold">Store builds</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            The Play Store and App Store packages are built from this same codebase with Capacitor. They are
            published after the store review completes — until then the installable app above is fully
            functional, and your account, rates and cost sheets are shared across every device.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">
                See plans <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="mailto:support@freshmcalc.com?subject=FreshmCalc%20app">
                Ask about the app <Share className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            Subscriptions are billed on the web (Razorpay) and unlock the same account inside the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformCard({
  icon: Icon,
  title,
  status,
  body,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  status: string;
  body: string;
  tone: 'ready' | 'soon';
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-display text-[14px] font-bold">{title}</p>
        </div>
        <span
          className={cn(
            'mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
            tone === 'ready'
              ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {status}
        </span>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
