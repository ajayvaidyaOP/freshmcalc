'use client';

import type * as React from 'react';
import { ArrowDownWideNarrow, CircleAlert, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatNumber } from '@/lib/format';

const SUPPORTED_CURRENCIES = new Set(['INR', 'AED']);
const VALID_CHARGE_STATUSES = new Set(['VERIFIED', 'INDICATIVE', 'UNCONFIRMED']);

interface ConfiguredChargesPanelProps {
  portsReady: boolean;
  portsLoading: boolean;
  portsError: boolean;
  onRetryPorts: () => void;
  charges: any[];
  chargesLoading: boolean;
  chargesError: boolean;
  onRetryCharges: () => void;
  shippingMode: string;
  routeLoading: boolean;
  routeError: boolean;
  onRetryRoute: () => void;
  routeCount: number;
  freightQuotes: any[];
  freightLoading: boolean;
  freightError: boolean;
  onRetryFreight: () => void;
  onAddCharge: (charge: any) => void;
  onAddFreight: (quote: any) => void;
}

export function ConfiguredChargesPanel(props: ConfiguredChargesPanelProps) {
  const hasConfiguredPorts = props.portsReady;
  return (
    <Card className="border-brand-200/80 dark:border-brand-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><ArrowDownWideNarrow className="h-4 w-4 text-brand-600" /> Configured route charges</CardTitle>
        <CardDescription>Charges are retrieved for the selected configured ports. Add records to the estimate deliberately; no unknown currency is converted.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {props.portsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading configured ports…</div>
        ) : props.portsError ? (
          <Notice icon={<CircleAlert className="h-4 w-4" />} text="Port records are unavailable. No port charges or freight quotes have been included." action={<Button type="button" size="sm" variant="outline" onClick={props.onRetryPorts}><RefreshCcw className="h-3.5 w-3.5" /> Retry</Button>} />
        ) : !hasConfiguredPorts ? (
          <Notice text="Select exact port names from the configured port suggestions in Step 2 to look up matching charge records. Manual port labels do not trigger a lookup." />
        ) : (
          <>
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Port charges</p>
              {props.chargesLoading ? (
                <div className="space-y-2"><div className="h-14 animate-pulse rounded-xl bg-muted" /><div className="h-14 animate-pulse rounded-xl bg-muted" /></div>
              ) : props.chargesError ? (
                <Notice text="Configured port charges could not be loaded. They are not included in this estimate." action={<Button type="button" size="sm" variant="outline" onClick={props.onRetryCharges}><RefreshCcw className="h-3.5 w-3.5" /> Retry</Button>} />
              ) : props.charges.length === 0 ? (
                <Notice text="No matching port-charge records are configured for these ports and shipment details. Port charges are not included." />
              ) : (
                <div className="space-y-2">
                  {props.charges.map((charge) => <ChargeOption key={charge.id} charge={charge} onAdd={() => props.onAddCharge(charge)} />)}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Route freight quotes</p>
              {props.shippingMode !== 'SEA' ? (
                <Notice text="The current route/freight-quote records cover sea routes only. No freight quote is applied for this shipping method." />
              ) : props.routeLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking configured routes…</div>
              ) : props.routeError ? (
                <Notice text="Configured routes could not be loaded. Freight is not included." action={<Button type="button" size="sm" variant="outline" onClick={props.onRetryRoute}><RefreshCcw className="h-3.5 w-3.5" /> Retry</Button>} />
              ) : props.routeCount > 1 ? (
                <Notice text="More than one operational route matches these ports. Freight lookup is paused to avoid selecting an ambiguous quote." />
              ) : props.routeCount === 0 ? (
                <Notice text="No operational route is configured for this port pair. Freight is not included." />
              ) : props.freightLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading route freight quotes…</div>
              ) : props.freightError ? (
                <Notice text="Route freight quotes could not be loaded. Freight is not included." action={<Button type="button" size="sm" variant="outline" onClick={props.onRetryFreight}><RefreshCcw className="h-3.5 w-3.5" /> Retry</Button>} />
              ) : props.freightQuotes.length === 0 ? (
                <Notice text="No freight quote is configured for this route and container type. Freight is not included." />
              ) : (
                <div className="space-y-2">
                  {props.freightQuotes.map((quote) => <FreightOption key={quote.id} quote={quote} onAdd={() => props.onAddFreight(quote)} />)}
                </div>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">Charge records show source, validity and verification status. Per-kg/tonne charges use the shipment’s net weight, per-carton uses the number of boxes, and per-container assumes one container per sheet. Check line items for duplicate costs before saving.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ChargeOption({ charge, onAdd }: { charge: any; onAdd: () => void }) {
  const status = String(charge.currentStatus || charge.verificationStatus || 'UNCONFIRMED').toUpperCase();
  const currencySupported = SUPPORTED_CURRENCIES.has(String(charge.currency).toUpperCase());
  const canAdd = VALID_CHARGE_STATUSES.has(status) && currencySupported;
  const label = status === 'VERIFIED' ? 'Add verified charge' : status === 'INDICATIVE' ? 'Add indicative estimate' : 'Add unconfirmed estimate';
  return (
    <article className="rounded-xl border border-border bg-background p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{charge.description}</p><StatusTag status={status} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{charge.portName} · {charge.direction.toLowerCase()} · {charge.chargeCategory.replace(/_/g, ' ').toLowerCase()}</p>
          <p className="mt-1 text-xs text-muted-foreground">{charge.shippingMode}{charge.containerType ? ` · ${charge.containerType}` : ''}{charge.productName ? ` · ${charge.productName}` : ''} · {charge.chargingBasis.replace(/_/g, ' ').toLowerCase()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Source: {charge.source || 'not recorded'} · Verified: {charge.lastVerifiedAt ? formatDate(charge.lastVerifiedAt) : 'not recorded'}</p>
          <p className="mt-1 text-xs text-muted-foreground">Valid from {formatDate(charge.effectiveFrom)} to {charge.effectiveUntil ? formatDate(charge.effectiveUntil) : 'no end date'}</p>
          {charge.conditions && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Conditions: {charge.conditions}</p>}
          {!currencySupported && <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{charge.currency} → INR/AED conversion is not configured. This charge cannot be included automatically.</p>}
          {currencySupported && <p className="mt-1 font-mono text-sm font-bold">{charge.currency} {formatNumber(Number(charge.amount), 4)} <span className="font-sans text-xs font-normal text-muted-foreground">{charge.chargingBasis.replace(/_/g, ' ').toLowerCase()}</span></p>}
        </div>
        <Button type="button" size="sm" variant={canAdd ? 'outline' : 'secondary'} disabled={!canAdd} onClick={onAdd} className="w-full shrink-0 sm:w-auto">
          {canAdd ? label : status === 'EXPIRED' ? 'Expired — excluded' : status === 'FUTURE' ? 'Not yet valid' : 'Unavailable'}
        </Button>
      </div>
    </article>
  );
}

function FreightOption({ quote, onAdd }: { quote: any; onAdd: () => void }) {
  const now = Date.now();
  const start = quote.effectiveDate ? new Date(quote.effectiveDate).getTime() : 0;
  const end = quote.expiryDate ? new Date(quote.expiryDate).getTime() : Infinity;
  const status = start > now ? 'FUTURE' : end < now ? 'EXPIRED' : 'ADMIN_ENTERED';
  const currencySupported = SUPPORTED_CURRENCIES.has(String(quote.currency).toUpperCase());
  const canAdd = status === 'ADMIN_ENTERED' && currencySupported;
  return (
    <article className="rounded-xl border border-border bg-background p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{quote.containerType} freight quote</p><StatusTag status={status} /></div>
          <p className="mt-1 font-mono text-sm font-bold">{quote.currency} {formatNumber(Number(quote.amount), 2)} per container</p>
          <p className="mt-1 text-xs text-muted-foreground">Source: {quote.source || 'not recorded'} · Effective {formatDate(quote.effectiveDate)} · Expires {quote.expiryDate ? formatDate(quote.expiryDate) : 'not stated'}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">The existing freight-quote record has no verification-status field; it is shown as admin-entered.</p>
          {!currencySupported && <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">No {quote.currency} conversion is configured; this quote cannot be added to the estimate.</p>}
        </div>
        <Button type="button" size="sm" variant="outline" disabled={!canAdd} onClick={onAdd} className="w-full shrink-0 sm:w-auto">{canAdd ? 'Add freight estimate' : status === 'EXPIRED' ? 'Expired — excluded' : status === 'FUTURE' ? 'Not yet valid' : 'Unavailable'}</Button>
      </div>
    </article>
  );
}

function StatusTag({ status }: { status: string }) {
  const style = status === 'VERIFIED' ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300'
    : status === 'INDICATIVE' || status === 'UNCONFIRMED' || status === 'ADMIN_ENTERED' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200';
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${style}`}>{status.replace(/_/g, ' ').toLowerCase()}</span>;
}

function Notice({ icon, text, action }: { icon?: React.ReactNode; text: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between"> <span className="flex items-start gap-2">{icon}{text}</span>{action}</div>;
}
