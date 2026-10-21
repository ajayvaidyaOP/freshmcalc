'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DollarSign, CreditCard, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { subscriptionsService } from '@/services/subscriptions.service';
import { paymentsService } from '@/services/payments.service';

export default function Subscription() {
  const { data: plans = [], isLoading: ploading } = useQuery({ queryKey: ['plans'], queryFn: subscriptionsService.listPlans });
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionsService.getActive,
    enabled: true,
    retry: false,
  });
  const { data: subscription, isLoading: sloading } = subscriptionQuery;
  const userRaw = localStorage.getItem('freshmcalc_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription & Payments</h1>
        <p className="text-muted-foreground">Manage your plan, payments and Razorpay receipts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {sloading ? (
            <div className="p-4">Loading subscription...</div>
          ) : subscriptionQuery.isError || !subscription ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted p-4 text-center">
                No active subscription. Select a plan below to subscribe.
              </div>
              <Button asChild className="w-full"><Link to="/pricing">View plans</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{subscription.planName}</span>
                <Badge variant={subscription.active ? 'success' : 'warn'}>
                  {subscription.active ? 'Active' : 'Expired'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <span className="font-mono text-sm">{subscription.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Period ends</span>
                <span className="font-mono text-sm">{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount paid</span>
                <span className="font-mono text-sm">₹{(subscription.amountPaid ?? 0) / 100}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Available plans</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {ploading ? <div className="p-4">Loading...</div> : (
            plans.map((p: any) => (
              <Card key={p.id} className="p-4">
                <CardTitle className="text-base">{p.name} plan</CardTitle>
                <div className="text-2xl font-bold mb-2">₹{(p.priceAmount ?? 0) / 100}</div>
                <div className="text-xs text-muted-foreground mb-3">{p.billingCycle.toLowerCase()}</div>
                <Button asChild className="w-full" disabled={!p.active}>
                  <Link to="/login">Subscribe</Link>
                </Button>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
