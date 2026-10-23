'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertCircle, Check, Edit3, Loader2, Plus, RotateCcw, Ship, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormField } from '@/components/layout/AuthLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { portsService } from '@/services/ports.service';
import { apiError } from '@/lib/api';
import { formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

const chargeSchema = z.object({
  portId: z.coerce.number().min(1, 'Choose a port.'),
  direction: z.enum(['ORIGIN', 'DESTINATION']),
  chargeCategory: z.string().min(2, 'Choose a charge category.'),
  description: z.string().trim().min(2, 'Enter a charge description.').max(180),
  amount: z.coerce.number().positive('Enter an amount greater than zero.'),
  currency: z.enum(['AED', 'INR', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'OMR', 'SGD']),
  chargingBasis: z.enum(['PER_SHIPMENT', 'PER_CONTAINER', 'PER_KG', 'PER_TONNE', 'PER_CARTON']),
  shippingMode: z.enum(['SEA', 'AIR', 'ROAD', 'RAIL', 'ANY']),
  containerType: z.string(),
  productName: z.string().max(150),
  conditions: z.string().max(500),
  effectiveFrom: z.string().min(1, 'Choose a valid-from date.'),
  effectiveUntil: z.string(),
  source: z.string().max(255),
  lastVerifiedAt: z.string(),
  verificationStatus: z.enum(['VERIFIED', 'INDICATIVE', 'UNCONFIRMED']),
  active: z.boolean(),
}).superRefine((v, ctx) => {
  if (v.effectiveUntil && v.effectiveUntil <= v.effectiveFrom) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['effectiveUntil'], message: 'Valid-until must be after valid-from.' });
  }
  if (v.verificationStatus === 'VERIFIED' && (!v.source.trim() || !v.lastVerifiedAt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['source'], message: 'Verified charges require a source and verification date.' });
  }
});

type ChargeForm = z.infer<typeof chargeSchema>;

const CATEGORIES = [
  ['PORT_HANDLING', 'Port handling'],
  ['TERMINAL_HANDLING', 'Terminal handling'],
  ['DOCUMENTATION', 'Documentation'],
  ['CUSTOMS_CLEARANCE', 'Customs clearance'],
  ['INSPECTION', 'Inspection'],
  ['STORAGE', 'Storage'],
  ['DELIVERY_ORDER', 'Delivery order'],
  ['OTHER', 'Other'],
] as const;

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateOnly = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateToIso = (value: string, endOfDay = false) => value
  ? new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`).toISOString()
  : null;

const EMPTY_FORM: ChargeForm = {
  portId: 0,
  direction: 'ORIGIN',
  chargeCategory: 'PORT_HANDLING',
  description: '',
  amount: 0,
  currency: 'INR',
  chargingBasis: 'PER_SHIPMENT',
  shippingMode: 'SEA',
  containerType: 'ANY',
  productName: '',
  conditions: '',
  effectiveFrom: today(),
  effectiveUntil: '',
  source: '',
  lastVerifiedAt: '',
  verificationStatus: 'UNCONFIRMED',
  active: true,
};

function statusVariant(status: string) {
  if (status === 'VERIFIED') return 'success' as const;
  if (status === 'INDICATIVE' || status === 'FUTURE') return 'warn' as const;
  if (status === 'EXPIRED' || status === 'INACTIVE') return 'danger' as const;
  return 'outline' as const;
}

export function PortChargesManager() {
  const queryClient = useQueryClient();
  const chargesQuery = useQuery({ queryKey: ['admin-port-charges'], queryFn: portsService.listCharges });
  const portsQuery = useQuery({ queryKey: ['ports'], queryFn: portsService.listPorts });
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const form = useForm<ChargeForm>({ resolver: zodResolver(chargeSchema), defaultValues: EMPTY_FORM });
  const charges: any[] = chargesQuery.data || [];
  const ports: any[] = portsQuery.data || [];
  const selectedPort = ports.find((port) => port.id === form.watch('portId'));
  const allowedDirections: ChargeForm['direction'][] = selectedPort?.portType === 'ORIGIN'
    ? ['ORIGIN']
    : selectedPort?.portType === 'DESTINATION'
      ? ['DESTINATION']
      : ['ORIGIN', 'DESTINATION'];

  const reset = () => {
    setEditingId(null);
    form.reset({ ...EMPTY_FORM, effectiveFrom: today() });
  };

  const onSubmit = async (values: ChargeForm) => {
    const payload = {
      ...values,
      direction: values.direction,
      currency: values.currency,
      chargeCategory: values.chargeCategory,
      containerType: values.containerType === 'ANY' ? null : values.containerType,
      productName: values.productName.trim() || null,
      conditions: values.conditions.trim() || null,
      source: values.source.trim() || null,
      effectiveFrom: dateToIso(values.effectiveFrom),
      effectiveUntil: dateToIso(values.effectiveUntil, true),
      lastVerifiedAt: dateToIso(values.lastVerifiedAt),
    };
    try {
      if (editingId) {
        await portsService.updateCharge(editingId, payload);
        toast({ title: 'Port charge updated', description: 'The configured charge has been saved.', variant: 'success' });
      } else {
        await portsService.createCharge(payload);
        toast({ title: 'Port charge added', description: 'The charge is now available to matching route lookups.', variant: 'success' });
      }
      reset();
      await queryClient.invalidateQueries({ queryKey: ['admin-port-charges'] });
      await queryClient.invalidateQueries({ queryKey: ['port-charges'] });
    } catch (error: any) {
      toast({ title: editingId ? 'Could not update charge' : 'Could not add charge', description: apiError(error), variant: 'destructive' });
    }
  };

  const edit = (charge: any) => {
    setEditingId(charge.id);
    form.reset({
      portId: charge.portId,
      direction: charge.direction,
      chargeCategory: charge.chargeCategory,
      description: charge.description,
      amount: Number(charge.amount),
      currency: charge.currency,
      chargingBasis: charge.chargingBasis,
      shippingMode: charge.shippingMode,
      containerType: charge.containerType || 'ANY',
      productName: charge.productName || '',
      conditions: charge.conditions || '',
      effectiveFrom: dateOnly(charge.effectiveFrom),
      effectiveUntil: dateOnly(charge.effectiveUntil),
      source: charge.source || '',
      lastVerifiedAt: dateOnly(charge.lastVerifiedAt),
      verificationStatus: charge.verificationStatus,
      active: Boolean(charge.active),
    });
    document.getElementById('port-charge-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleActive = async (charge: any) => {
    const payload = {
      portId: charge.portId,
      direction: charge.direction,
      chargeCategory: charge.chargeCategory,
      description: charge.description,
      amount: Number(charge.amount),
      currency: charge.currency,
      chargingBasis: charge.chargingBasis,
      shippingMode: charge.shippingMode,
      containerType: charge.containerType,
      productName: charge.productName,
      conditions: charge.conditions,
      effectiveFrom: charge.effectiveFrom,
      effectiveUntil: charge.effectiveUntil,
      source: charge.source,
      lastVerifiedAt: charge.lastVerifiedAt,
      verificationStatus: charge.verificationStatus,
      active: !charge.active,
    };
    try {
      await portsService.updateCharge(charge.id, payload);
      toast({ title: charge.active ? 'Charge deactivated' : 'Charge activated', variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['admin-port-charges'] });
      await queryClient.invalidateQueries({ queryKey: ['port-charges'] });
    } catch (error: any) {
      toast({ title: 'Could not change charge status', description: apiError(error), variant: 'destructive' });
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="port-charges-heading">
      <Card>
        <CardHeader>
          <CardTitle id="port-charges-heading">Port charges</CardTitle>
          <CardDescription>
            Add sourced, date-bounded charges by port and shipment type. Only records marked as verified should be treated as verified rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chargesQuery.isLoading ? (
            <div className="space-y-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>
          ) : chargesQuery.isError ? (
            <EmptyState icon={AlertCircle} title="Could not load port charges" description="Try again. Existing port and freight records have not been changed." action={<Button type="button" variant="outline" onClick={() => chargesQuery.refetch()}><RotateCcw className="h-4 w-4" /> Retry</Button>} />
          ) : charges.length === 0 ? (
            <EmptyState icon={Ship} title="No port charges configured" description="Add verified or clearly identified indicative charges below. No charge values are prefilled." className="py-6" />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {charges.map((charge) => <ChargeCard key={charge.id} charge={charge} onEdit={() => edit(charge)} onToggle={() => toggleActive(charge)} />)}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader><TableRow><TableHead>Port / direction</TableHead><TableHead>Charge</TableHead><TableHead>Amount / basis</TableHead><TableHead>Validity / source</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {charges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell><p className="font-semibold">{charge.portName}</p><p className="text-xs text-muted-foreground">{charge.direction} · {charge.portUnlocode}</p></TableCell>
                        <TableCell><p className="font-semibold">{charge.description}</p><p className="text-xs text-muted-foreground">{charge.chargeCategory} · {charge.shippingMode}{charge.containerType ? ` · ${charge.containerType}` : ''}</p></TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-sm">{charge.currency} {formatNumber(Number(charge.amount), 2)}<p className="font-sans text-xs text-muted-foreground">{charge.chargingBasis.replace(/_/g, ' ').toLowerCase()}</p></TableCell>
                        <TableCell><p className="text-xs">{formatDate(charge.effectiveFrom)} – {charge.effectiveUntil ? formatDate(charge.effectiveUntil) : 'No end date'}</p><p className="max-w-[180px] truncate text-xs text-muted-foreground" title={charge.source || 'Source not recorded'}>{charge.source || 'Source not recorded'}</p></TableCell>
                        <TableCell><StatusBadge status={charge.currentStatus} /><p className="mt-1 text-[10px] text-muted-foreground">Verified {formatDate(charge.lastVerifiedAt)}</p></TableCell>
                        <TableCell><div className="flex gap-1"><Button type="button" size="sm" variant="outline" onClick={() => edit(charge)} aria-label={`Edit ${charge.description}`}><Edit3 className="h-3.5 w-3.5" /></Button><Button type="button" size="sm" variant="outline" onClick={() => toggleActive(charge)}>{charge.active ? 'Deactivate' : 'Activate'}</Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card id="port-charge-form">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit port charge' : 'Add a port charge'}</CardTitle>
          <CardDescription>All amounts are entered with their currency and charging basis. The system does not supply official port rates.</CardDescription>
        </CardHeader>
        <CardContent>
          {portsQuery.isError ? (
            <p role="alert" className="text-sm text-destructive">Port records could not be loaded. Retry the ports list before adding a charge.</p>
          ) : ports.length === 0 && !portsQuery.isLoading ? (
            <EmptyState icon={Ship} title="Add a port first" description="Create an origin or destination port before attaching charges." />
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FormField label="Port" error={form.formState.errors.portId?.message}>
                  <Select value={form.watch('portId') ? String(form.watch('portId')) : undefined} onValueChange={(v) => {
                    const portId = Number(v);
                    form.setValue('portId', portId, { shouldValidate: true });
                    const port = ports.find((item) => item.id === portId);
                    if (port?.portType === 'ORIGIN' || port?.portType === 'DESTINATION') {
                      form.setValue('direction', port.portType, { shouldValidate: true });
                    }
                  }}>
                    <SelectTrigger aria-label="Port"><SelectValue placeholder="Select port" /></SelectTrigger>
                    <SelectContent>{ports.map((port) => <SelectItem key={port.id} value={String(port.id)}>{port.name} · {port.unlocode}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Direction" error={form.formState.errors.direction?.message}>
                  <Select value={form.watch('direction')} onValueChange={(v) => form.setValue('direction', v as ChargeForm['direction'], { shouldValidate: true })}>
                    <SelectTrigger disabled={Boolean(selectedPort && selectedPort.portType !== 'BOTH')}><SelectValue /></SelectTrigger><SelectContent>{allowedDirections.map((direction) => <SelectItem key={direction} value={direction}>{direction === 'ORIGIN' ? 'Origin' : 'Destination'}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Charge category" error={form.formState.errors.chargeCategory?.message}>
                  <Select value={form.watch('chargeCategory')} onValueChange={(v) => form.setValue('chargeCategory', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Charge description" error={form.formState.errors.description?.message}><Input {...form.register('description')} placeholder="e.g. Terminal handling charge" /></FormField>
                <FormField label="Amount" error={form.formState.errors.amount?.message}><Input type="number" inputMode="decimal" min="0.0001" step="0.0001" {...form.register('amount')} /></FormField>
                <FormField label="Currency" error={form.formState.errors.currency?.message}>
                  <Select value={form.watch('currency')} onValueChange={(v) => form.setValue('currency', v as ChargeForm['currency'], { shouldValidate: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['AED', 'INR', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'OMR', 'SGD'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Charging basis" error={form.formState.errors.chargingBasis?.message}>
                  <Select value={form.watch('chargingBasis')} onValueChange={(v) => form.setValue('chargingBasis', v as ChargeForm['chargingBasis'], { shouldValidate: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PER_SHIPMENT">Per shipment</SelectItem><SelectItem value="PER_CONTAINER">Per container</SelectItem><SelectItem value="PER_KG">Per kilogram</SelectItem><SelectItem value="PER_TONNE">Per metric tonne</SelectItem><SelectItem value="PER_CARTON">Per carton / box</SelectItem></SelectContent>
                  </Select>
                </FormField>
                <FormField label="Shipping mode" error={form.formState.errors.shippingMode?.message}>
                  <Select value={form.watch('shippingMode')} onValueChange={(v) => form.setValue('shippingMode', v as ChargeForm['shippingMode'], { shouldValidate: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SEA">Sea freight</SelectItem><SelectItem value="AIR">Air freight</SelectItem><SelectItem value="ROAD">Road</SelectItem><SelectItem value="RAIL">Rail</SelectItem><SelectItem value="ANY">Any mode</SelectItem></SelectContent>
                  </Select>
                </FormField>
                <FormField label="Container type" hint="Choose Any if the charge is not container-specific."><Select value={form.watch('containerType')} onValueChange={(v) => form.setValue('containerType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ANY">Any / not applicable</SelectItem><SelectItem value="REEFER">Reefer</SelectItem><SelectItem value="20FT">20 ft</SelectItem><SelectItem value="40FT">40 ft</SelectItem><SelectItem value="40HC">40 ft high cube</SelectItem></SelectContent></Select></FormField>
                <FormField label="Product (optional)" hint="Leave blank to apply to all products."><Input {...form.register('productName')} placeholder="e.g. Pomegranate" /></FormField>
                <FormField label="Valid from" error={form.formState.errors.effectiveFrom?.message}><Input type="date" {...form.register('effectiveFrom')} /></FormField>
                <FormField label="Valid until (optional)" error={form.formState.errors.effectiveUntil?.message}><Input type="date" {...form.register('effectiveUntil')} /></FormField>
                <FormField label="Data source" error={form.formState.errors.source?.message}><Input {...form.register('source')} placeholder="Provider, tariff sheet or reference" /></FormField>
                <FormField label="Last verified (optional)" error={form.formState.errors.lastVerifiedAt?.message}><Input type="date" {...form.register('lastVerifiedAt')} /></FormField>
                <FormField label="Verification status" error={form.formState.errors.verificationStatus?.message}>
                  <Select value={form.watch('verificationStatus')} onValueChange={(v) => form.setValue('verificationStatus', v as ChargeForm['verificationStatus'], { shouldValidate: true })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VERIFIED">Verified</SelectItem><SelectItem value="INDICATIVE">Indicative</SelectItem><SelectItem value="UNCONFIRMED">Unconfirmed</SelectItem></SelectContent>
                  </Select>
                </FormField>
                <div className="flex items-end pb-1"><label className="flex min-h-[44px] items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-brand-700" {...form.register('active')} /> Active for applicable lookups</label></div>
                <div className="sm:col-span-2 xl:col-span-3"><FormField label="Applicability conditions (optional)" error={form.formState.errors.conditions?.message}><Input {...form.register('conditions')} placeholder="Conditions that admins or traders should check" /></FormField></div>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                {editingId && <Button type="button" variant="outline" onClick={reset}><X className="h-4 w-4" /> Cancel edit</Button>}
                <Button type="submit" disabled={form.formState.isSubmitting || portsQuery.isLoading}>
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingId ? 'Save changes' : 'Add port charge'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant(status)}>{status.replace(/_/g, ' ').toLowerCase()}</Badge>;
}

function ChargeCard({ charge, onEdit, onToggle }: { charge: any; onEdit: () => void; onToggle: () => void }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-semibold">{charge.description}</p><p className="mt-0.5 text-xs text-muted-foreground">{charge.portName} · {charge.direction}</p></div>
        <StatusBadge status={charge.currentStatus} />
      </div>
      <p className="mt-3 font-mono text-sm font-semibold">{charge.currency} {formatNumber(Number(charge.amount), 2)} <span className="font-sans text-xs font-normal text-muted-foreground">/ {charge.chargingBasis.replace(/_/g, ' ').toLowerCase()}</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{charge.shippingMode}{charge.containerType ? ` · ${charge.containerType}` : ''} · {formatDate(charge.effectiveFrom)} to {charge.effectiveUntil ? formatDate(charge.effectiveUntil) : 'open-ended'}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">Source: {charge.source || 'not recorded'} · Verified: {formatDateTime(charge.lastVerifiedAt)}</p>
      {charge.conditions && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{charge.conditions}</p>}
      <div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={onEdit}><Edit3 className="h-3.5 w-3.5" /> Edit</Button><Button type="button" size="sm" variant="outline" onClick={onToggle}>{charge.active ? 'Deactivate' : 'Activate'}</Button></div>
    </article>
  );
}
