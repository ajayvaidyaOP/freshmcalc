'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Globe, Shirt, CreditCard, FileText, DollarSign, Settings, ShieldAlert, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ratesService } from '@/services/rates.service';
import { subscriptionsService } from '@/services/subscriptions.service';

export default function Dashboard() {
  const { data: rates = [], isLoading } = useQuery({ queryKey: ['rates'], queryFn: ratesService.listPublished });
  const userRaw = localStorage.getItem('freshmcalc_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const planEnt = user?.planEntitlements || {};
  const activeSub = user?.activeSubscription;

  const dubaiRates = rates.filter((r: any) => r.country === 'UAE' && r.city === 'Dubai');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dubai Market Overview</h1>
          <p className="text-muted-foreground">FreshmCalc — Dubai, UAE (AED). All rates shown are Dubai wholesale market rates.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} /> Market: <strong>Dubai, UAE</strong> &bull; Currency: <strong>AED</strong>
        </div>
      </div>

      {/* Alert banner for market */}
      <div className="rounded-lg border border-emerald/20 bg-emerald/50 p-4 text-emerald-800 text-sm">
        Market focus: <strong>Dubai, UAE (AED)</strong> — selling-price analysis & profit calculations. India is the sourcing/origin market only. Indian domestic prices are never shown as Dubai rates.
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Dubai products tracked" value={dubaiRates.length} icon={Globe} />
        <StatCard title="Primary currency" value="AED" icon={Shirt} />
        <StatCard title="Last updated" value={dubaiRates.length > 0 ? new Date(dubaiRates[0].lastUpdated || Date.now()).toLocaleString() : '—'} icon={Clock} />
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Dubai Product Rates</CardTitle>
              <CardDescription>Publisher-published rates. Never Indian domestic prices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4">Loading Dubai rates...</div>
              ) : dubaiRates.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No published Dubai market rates yet.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground">Product</th>
                        <th className="text-left p-3 text-muted-foreground">Variety / Grade</th>
                        <th className="text-left p-3 text-muted-foreground">Market</th>
                        <th className="text-right p-3 text-muted-foreground">Price</th>
                        <th className="text-left p-3 text-muted-foreground">Unit</th>
                        <th className="text-left p-3 text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-muted-foreground">Last updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dubaiRates.map((r: any) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-3 font-medium">{r.productName}</td>
                          <td className="p-3">{r.variety} / {r.grade}</td>
                          <td className="p-3 text-xs text-muted-foreground">{r.marketName}, {r.city}, {r.country}</td>
                          <td className="p-3 text-right font-mono">{r.priceAmount} {r.currency}</td>
                          <td className="p-3">{r.pricingUnit}</td>
                          <td className="p-3"><Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full"><Link to="/rates">View all Dubai rates</Link></Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan and entitlements.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{activeSub?.planName || 'No active plan'}</span>
                  <Badge variant={activeSub?.active ? 'success' : 'warn'}>
                    {activeSub?.active ? 'Active' : 'Inactive / Expired'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Period ends</span>
                  <span className="font-mono">{activeSub?.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd).toLocaleDateString() : '—'}</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {[
                    { k: 'dubaiRatesAccess', label: 'Dubai rates' },
                    { k: 'calculatorAccess', label: 'Export calculator' },
                    { k: 'pdfExportAccess', label: 'PDF quotations' },
                    { k: 'savedCalculationsAccess', label: 'Saved cost sheets' },
                  ].map((f) => (
                    <li key={f.k} className="flex justify-between">
                      <span>{f.label}</span>
                      <span className={planEnt[f.k] ? 'text-emerald-600' : 'text-muted-foreground'}>
                        {planEnt[f.k] ? 'Included' : 'Not included'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full"><Link to="/subscription">Manage subscription</Link></Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={CreditCard} label="Export Calculator" href="/calculator" feature={planEnt.calculatorAccess} />
            <QuickAction icon={FileText} label="Saved Cost Sheets" href="/calculations" feature={planEnt.savedCalculationsAccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, href, feature }: { icon: React.ElementType; label: string; href: string; feature: boolean }) {
  return (
    <a href={href} onClick={(e) => { if (!feature) e.preventDefault(); }}
       className="flex flex-col items-center gap-2 rounded-lg border border-input bg-card p-4 text-sm hover:bg-accent transition-colors {feature ? '' : 'opacity-50'}" title={feature ? '' : 'Requires paid plan'}>
      <Icon className="h-6 w-6 text-muted-foreground" />
      <span>{label}</span>
    </a>
  );
}
