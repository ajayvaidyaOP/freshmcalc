'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Anchor, ArrowRight, Container, Loader2, Route as RouteIcon, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { FormField } from '@/components/layout/AuthLayout';
import { portsService } from '@/services/ports.service';
import { routesService } from '@/services/routes.service';
import { apiError } from '@/lib/api';
import { formatNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const portSchema = z.object({
  name: z.string().min(1, 'Port name is required'),
  unlocode: z.string().min(1, 'UN/LOCODE is required'),
  portType: z.string().min(1),
  supportsContainer: z.boolean(),
  supportsReefer: z.boolean(),
});

const quoteSchema = z.object({
  routeId: z.coerce.number().min(1, 'Select a route'),
  containerType: z.string().min(1),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.string().min(1),
  source: z.string().optional(),
});

export default function AdminPorts() {
  const queryClient = useQueryClient();
  const portsQ = useQuery({ queryKey: ['ports'], queryFn: portsService.listPorts });
  const routesQ = useQuery({ queryKey: ['routes'], queryFn: routesService.listRoutes });
  const quotesQ = useQuery({ queryKey: ['freight-quotes'], queryFn: routesService.listFreightQuotes });
  const ports = portsQ.data || [];
  const routes = routesQ.data || [];
  const quotes = quotesQ.data || [];

  const portForm = useForm<z.infer<typeof portSchema>>({
    resolver: zodResolver(portSchema),
    defaultValues: { name: '', unlocode: '', portType: 'SEA', supportsContainer: true, supportsReefer: true },
  });
  const quoteForm = useForm<z.infer<typeof quoteSchema>>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { routeId: 0, containerType: 'REEFER', amount: 0, currency: 'USD', source: '' },
  });

  const addPort = async (data: z.infer<typeof portSchema>) => {
    try {
      await portsService.createPort(data);
      toast({ title: 'Port added', description: data.name, variant: 'success' });
      portForm.reset({ name: '', unlocode: '', portType: 'SEA', supportsContainer: true, supportsReefer: true });
      queryClient.invalidateQueries({ queryKey: ['ports'] });
    } catch (e: any) {
      toast({ title: 'Could not add port', description: apiError(e), variant: 'destructive' });
    }
  };

  const addQuote = async (data: z.infer<typeof quoteSchema>) => {
    try {
      await routesService.createFreightQuote(data);
      toast({ title: 'Freight quote added', description: `${data.containerType} · ${data.currency} ${data.amount}`, variant: 'success' });
      quoteForm.reset({ routeId: 0, containerType: 'REEFER', amount: 0, currency: 'USD', source: '' });
      queryClient.invalidateQueries({ queryKey: ['freight-quotes'] });
    } catch (e: any) {
      toast({ title: 'Could not add quote', description: apiError(e), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Ports & Routes"
        description="Indian origin ports, Dubai destination routes, transit times and freight quotations."
      />

      {/* Routes as visual cards */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <RouteIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Shipping routes <Badge variant="soft">{routes.length}</Badge>
        </h2>
        {routesQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[118px] rounded-3xl" />)}</div>
        ) : routes.length === 0 ? (
          <Card><EmptyState icon={Ship} title="No routes configured" description="Routes are seeded with reference data (e.g. JNPA → Jebel Ali) and will appear here." className="py-8" /></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {routes.map((r: any) => (
              <article key={r.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="min-w-0 flex-1 truncate text-right">{shortPort(r.originPortName)}</span>
                  <span className="flex shrink-0 items-center gap-1 text-brand-600 dark:text-brand-400">
                    <span className="h-px w-4 bg-current opacity-50" />
                    <Ship className="h-4 w-4" />
                    <span className="h-px w-4 bg-current opacity-50" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{shortPort(r.destinationPortName)}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={r.operational ? 'success' : 'warn'}>{r.operational ? 'Operational' : 'Paused'}</Badge>
                  {r.transitTimeDays != null && <Badge variant="outline">{r.transitTimeDays} days transit</Badge>}
                  {r.transshipmentRequired && <Badge variant="outline">Transshipment</Badge>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        {/* Ports table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Anchor className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Ports <Badge variant="soft">{ports.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {portsQ.isLoading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : ports.length === 0 ? (
              <EmptyState icon={Anchor} title="No ports yet" description="Add ports like JNPA / Nhava Sheva and Jebel Ali using the form below." className="py-8" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Port</TableHead><TableHead>UN/LOCODE</TableHead><TableHead>Country</TableHead><TableHead>Reefer</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {ports.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold">{p.name}</TableCell>
                      <TableCell className="font-mono text-[13px] text-muted-foreground">{p.unlocode || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{[p.cityName, p.countryName].filter(Boolean).join(', ') || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={p.supportsReefer ? 'success' : 'outline'}>{p.supportsReefer ? 'Reefer OK' : 'No reefer'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Freight quotes */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Container className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Freight quotes <Badge variant="soft">{quotes.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {quotesQ.isLoading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : quotes.length === 0 ? (
              <EmptyState icon={Container} title="No freight quotes yet" description="Add current container freight quotes so costings can reference them." className="py-8" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Container</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Source</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell><Badge variant="outline">{q.containerType}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-semibold">{q.currency} {formatNumber(Number(q.amount))}</TableCell>
                      <TableCell className="text-muted-foreground">{q.source || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Add port</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={portForm.handleSubmit(addPort)} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Port name" error={portForm.formState.errors.name?.message}>
                  <Input placeholder="JNPA / Nhava Sheva" {...portForm.register('name')} />
                </FormField>
                <FormField label="UN/LOCODE" error={portForm.formState.errors.unlocode?.message}>
                  <Input placeholder="INNSA" className="font-mono uppercase" {...portForm.register('unlocode')} />
                </FormField>
              </div>
              <FormField label="Port type">
                <Controller
                  control={portForm.control}
                  name="portType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEA">Sea port</SelectItem>
                        <SelectItem value="AIR">Air cargo</SelectItem>
                        <SelectItem value="ICD">Inland container depot (ICD)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <div className="flex flex-wrap gap-2">
                <ToggleChip label="Container support" checked={portForm.watch('supportsContainer')} onToggle={(v) => portForm.setValue('supportsContainer', v)} />
                <ToggleChip label="Reefer plugs" checked={portForm.watch('supportsReefer')} onToggle={(v) => portForm.setValue('supportsReefer', v)} />
              </div>
              <Button type="submit" className="w-full" disabled={portForm.formState.isSubmitting}>
                {portForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Anchor className="h-4 w-4" />} Add port
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Add freight quote</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={quoteForm.handleSubmit(addQuote)} className="space-y-4" noValidate>
              <FormField label="Route" error={quoteForm.formState.errors.routeId?.message}>
                <Controller
                  control={quoteForm.control}
                  name="routeId"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger><SelectValue placeholder={routesQ.isLoading ? 'Loading routes…' : 'Select route'} /></SelectTrigger>
                      <SelectContent>
                        {routes.map((r: any) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {shortPort(r.originPortName)} → {shortPort(r.destinationPortName)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Container type">
                  <Controller
                    control={quoteForm.control}
                    name="containerType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REEFER">Reefer</SelectItem>
                          <SelectItem value="20FT">20 FT Dry</SelectItem>
                          <SelectItem value="40FT">40 FT Dry</SelectItem>
                          <SelectItem value="40HC">40 FT High Cube</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Amount" error={quoteForm.formState.errors.amount?.message}>
                  <Input type="number" inputMode="decimal" step="any" placeholder="1450" {...quoteForm.register('amount')} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Currency">
                  <Controller
                    control={quoteForm.control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Source (optional)">
                  <Input placeholder="e.g. Maersk spot quote" {...quoteForm.register('source')} />
                </FormField>
              </div>
              <Button type="submit" className="w-full" disabled={quoteForm.formState.isSubmitting}>
                {quoteForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Add quote
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function shortPort(p?: string) {
  if (!p) return '—';
  return p.split(',')[0].replace(' Port', '').trim();
}

function ToggleChip({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onToggle(!checked)}
      className={cn(
        'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition-all active:scale-95',
        checked
          ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
          : 'border-border bg-card text-muted-foreground hover:border-brand-300'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', checked ? 'bg-lime-300' : 'bg-muted-foreground/50')} />
      {label}
    </button>
  );
}
