'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CheckCheck, ShieldCheck } from 'lucide-react';
import { subscriptionsService } from '@/services/subscriptions.service';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  'Dubai market rates (AED)',
  'Export cost calculator',
  'Saved cost sheets & PDF quotes',
  'Price history & trends',
  'Subscription & payment management',
];

export default function Pricing() {
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['plans'], queryFn: subscriptionsService.listPlans });

  if (isLoading) return <div className="py-10 text-center">Loading plans...</div>;

  return (
    <div className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Choose the plan that fits your trading volume. All plans priced in INR.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan: any) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-4 max-w-md mx-auto">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /><span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: any) {
  const popular = plan.name === 'Quarterly';
  const monthly = plan.billingCycle === 'MONTHLY';
  const price = (plan.priceAmount / 100).toFixed(0);
  return (
    <Card className={`p-6 relative ${popular ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
      {popular && <Badge className="absolute top-4 right-4">Popular</Badge>}
      <CardHeader>
        <CardTitle>{plan.name} plan</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <span className="text-4xl font-bold">₹{price}</span>
          <span className="text-muted-foreground text-sm">/{plan.billingCycle.toLowerCase()}</span>
        </div>
        <Button asChild className={`w-full ${popular ? 'bg-primary text-primary-foreground' : 'outline'}`} disabled={!plan.active}>
          <Link to="/login">Subscribe</Link>
        </Button>
      </CardContent>
      <CardFooter>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[true, true, true, monthly ? false : true, true].filter(Boolean).map((_, i) => (
            <li key={i} className="flex items-center gap-2"><CheckCheck size={14} className="text-emerald-600" />{FEATURES[i]}</li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  );
}
