'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, LogIn, Mail, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Public account-deletion page.
 *
 * Google Play requires a *publicly reachable* URL that explains how a user can
 * delete their account and what happens to their data — it cannot sit behind a
 * login. The actual one-tap deletion lives in Settings.
 */
export default function AccountDeletion() {
  return (
    <div className="container max-w-3xl py-10 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:flex">
          <Trash2 className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Delete your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For the FreshmCalc Android app, iPhone app and freshmcalc.com.
          </p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-6 px-5 py-7 sm:px-8">
          <section>
            <h2 className="font-display text-[17px] font-bold">Delete from inside the app (instant)</h2>
            <ol className="mt-3 space-y-3 text-[14.5px] text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-extrabold text-brand-800 dark:bg-brand-900 dark:text-brand-200">1</span>
                <span className="flex items-center gap-1.5"><LogIn className="h-4 w-4" /> Sign in to your FreshmCalc account.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-extrabold text-brand-800 dark:bg-brand-900 dark:text-brand-200">2</span>
                <span className="flex items-center gap-1.5"><Settings className="h-4 w-4" /> Open <strong className="text-foreground">Settings</strong> → <strong className="text-foreground">Delete account</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-extrabold text-brand-800 dark:bg-brand-900 dark:text-brand-200">3</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Type <span className="font-mono font-bold text-foreground">DELETE</span> and confirm. It happens immediately.</span>
              </li>
            </ol>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </section>

          <section className="rounded-2xl bg-muted/60 p-4">
            <h2 className="font-display text-[17px] font-bold">What gets deleted</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14.5px] text-muted-foreground">
              <li>Your name, email, phone, company, city and country.</li>
              <li>Every saved cost sheet and calculation line.</li>
              <li>Your active subscription is cancelled immediately (no further renewals).</li>
            </ul>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Payment and invoice records are kept in anonymised form for the period required by Indian tax law (8
              years). Card details are never stored by FreshmCalc — they stay with Razorpay.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[17px] font-bold">Can't sign in?</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
              Email us from the address on the account and we will delete it within 7 days. Include your registered
              email and, if possible, the Razorpay order id of your last payment.
            </p>
            <p className="mt-2 flex items-center gap-2 text-[14.5px]">
              <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <a href="mailto:support@freshmcalc.com?subject=Delete%20my%20FreshmCalc%20account" className="font-semibold underline underline-offset-4">
                support@freshmcalc.com
              </a>
            </p>
          </section>

          <p className="text-[13px] text-muted-foreground">
            See also the <Link to="/privacy" className="font-semibold underline underline-offset-4">privacy policy</Link>{' '}
            and <Link to="/terms" className="font-semibold underline underline-offset-4">terms of service</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
