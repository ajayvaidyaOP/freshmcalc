'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, MailPlus, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';

export default function AdminUsers() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Users & Subscriptions"
        description="Customer accounts, roles and plan entitlements. Registration is self-service — new traders appear here as they sign up."
        actions={
          <Button asChild>
            <Link to="/register">
              <MailPlus className="h-4 w-4" /> Invite via signup link
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Users,
            title: 'Trader accounts',
            desc: 'Exporters, wholesalers and suppliers register with email & company details. Each account is isolated — users only ever see their own cost sheets.',
          },
          {
            icon: ShieldCheck,
            title: 'Role-based access',
            desc: 'ADMIN accounts manage rates, products and ports. CUSTOMER accounts get market & calculator access based on their subscription entitlements.',
          },
          {
            icon: MailPlus,
            title: 'Plan entitlements',
            desc: 'Dubai rates, calculator, PDF export and saved sheets unlock automatically when a Razorpay subscription is active, and lock when it expires.',
          },
        ].map((c) => (
          <Card key={c.title} className="p-6">
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-base font-bold">{c.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Registered users</CardTitle>
          <CardDescription>Accounts are created through the public registration flow.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <EmptyState
            icon={Users}
            title="User directory loads from the server"
            description="Once customers register, their accounts, roles and subscription status are managed here. Share the signup link to onboard your first traders."
            action={
              <Button asChild variant="outline">
                <Link to="/register">
                  Open registration page <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
