'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Crown, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isNativeApp } from '@/lib/platform';

interface PlanLockProps {
  title: string;
  description: string;
  /** What the plan includes — shown as ticks. */
  benefits?: string[];
}

/**
 * Friendly paywall shown instead of an error when the plan doesn't include a
 * feature. The server enforces the same rule (HTTP 403), so this is only UX.
 */
export function PlanLock({ title, description, benefits = [] }: PlanLockProps) {
  // Native builds don't sell plans in-app (App Store 3.1.1 / Play billing), so
  // point the user to a human instead of a purchase page.
  const native = isNativeApp();

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-16">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
          <Lock className="h-7 w-7" />
        </span>
        <div className="max-w-md">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        {benefits.length > 0 && (
          <ul className="mt-1 grid gap-1.5 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-[13px] font-semibold">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" strokeWidth={3} />
                {benefit}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {native ? (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="mailto:support@freshmcalc.com?subject=Enable%20my%20FreshmCalc%20plan">
                  <Mail className="h-4 w-4" /> Ask about your plan
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/subscription">
                  Plan status <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/subscription">
                  <Crown className="h-4 w-4" /> View plans from ₹499
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/pricing">
                  Compare plans <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
