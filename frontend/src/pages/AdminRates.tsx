'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock3, Loader2, Megaphone, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { FreshnessTag } from '@/components/common/ProductAvatar';
import { FormField } from '@/components/layout/AuthLayout';
import { ratesService } from '@/services/rates.service';
import { productsService } from '@/services/products.service';
import { apiError } from '@/lib/api';
import { formatAED } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  productVarietyId: z.coerce.number().min(1, 'Select a product variety'),
  marketName: z.string().min(1, 'Market name is required'),
  country: z.string().min(1),
  city: z.string().min(1),
  priceAmount: z.coerce.number().positive('Price must be greater than 0'),
  currency: z.string().min(1),
  pricingUnit: z.string().min(1),
  packagingDetails: z.string().optional(),
  originCountry: z.string().optional(),
  effectiveDateTime: z.string().optional(),
  dataSource: z.string().min(1),
  sourceReference: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  productVarietyId: 0,
  marketName: 'Al Aweer Wholesale Market, Dubai',
  country: 'UAE',
  city: 'Dubai',
  priceAmount: 0,
  currency: 'AED',
  pricingUnit: 'per box',
  packagingDetails: '',
  originCountry: 'India',
  effectiveDateTime: '',
  dataSource: 'ADMIN',
  sourceReference: '',
};

export default function AdminRates() {
  const queryClient = useQueryClient();
  const varietiesQ = useQuery({ queryKey: ['varieties'], queryFn: productsService.listVarieties });
  const ratesQ = useQuery({ queryKey: ['rates'], queryFn: ratesService.listPublished });
  const varieties = varietiesQ.data || [];
  const rates = ratesQ.data || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rates'] });

  const staleMutation = useMutation({
    mutationFn: (id: number) => ratesService.markStale(id),
    onSuccess: () => {
      toast({ title: 'Rate marked stale', description: 'Customers will see it flagged as outdated.', variant: 'success' });
      invalidate();
    },
    onError: (e) => toast({ title: 'Action failed', description: apiError(e), variant: 'destructive' }),
  });

  const onSubmit = async (data: Values) => {
    try {
      await ratesService.createRate({
        ...data,
        effectiveDateTime: data.effectiveDateTime ? new Date(data.effectiveDateTime).toISOString() : new Date().toISOString(),
      });
      toast({ title: 'Dubai rate published', description: 'Customers can now see this AED price.', variant: 'success' });
      reset(DEFAULTS);
      invalidate();
    } catch (e: any) {
      toast({ title: 'Could not publish rate', description: apiError(e), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Manage Dubai Market Rates"
        description="Publish Dubai, UAE wholesale prices in AED. Rates are admin-entered and labelled with source & time — never Indian domestic prices."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[420px_1fr]">
        {/* Publish form */}
        <Card className="xl:sticky xl:top-[92px]">
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-base">Publish a Dubai rate</CardTitle>
              <p className="text-[13px] text-muted-foreground">Goes live for subscribers instantly.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField label="Product variety" error={errors.productVarietyId?.message}>
                <Controller
                  control={control}
                  name="productVarietyId"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder={varietiesQ.isLoading ? 'Loading varieties…' : 'Select variety'} />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties.map((v: any) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.productName} — {v.variety} / {v.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {!varietiesQ.isLoading && varieties.length === 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">No varieties yet — add products & varieties first.</p>
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Price amount" error={errors.priceAmount?.message}>
                  <Input type="number" inputMode="decimal" step="any" placeholder="42.50" {...register('priceAmount')} />
                </FormField>
                <FormField label="Currency">
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="AED">AED (Dubai)</SelectItem></SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Pricing unit">
                  <Controller
                    control={control}
                    name="pricingUnit"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per box">Per box</SelectItem>
                          <SelectItem value="per carton">Per carton</SelectItem>
                          <SelectItem value="per kg">Per kg</SelectItem>
                          <SelectItem value="per tonne">Per tonne</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Origin country">
                  <Input {...register('originCountry')} />
                </FormField>
              </div>

              <FormField label="Market name" error={errors.marketName?.message}>
                <Input {...register('marketName')} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="City"><Input {...register('city')} /></FormField>
                <FormField label="Country"><Input {...register('country')} /></FormField>
              </div>
              <FormField label="Packaging details">
                <Input placeholder="e.g. 5 kg export carton" {...register('packagingDetails')} />
              </FormField>
              <FormField label="Effective date & time" hint="Leave empty to publish with current time.">
                <Input type="datetime-local" {...register('effectiveDateTime')} />
              </FormField>
              <FormField label="Source reference">
                <Input placeholder="e.g. Al Aweer morning auction, ref-001" {...register('sourceReference')} />
              </FormField>

              <input type="hidden" {...register('dataSource')} />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Publishing…</> : <><Save className="h-5 w-5" /> Publish Dubai rate</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Published list */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Published rates
              <Badge variant="soft">{rates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {ratesQ.isLoading ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : rates.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No rates published yet" description="Publish your first Dubai AED rate using the form — subscribers will see it immediately." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Freshness</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="block font-bold leading-tight">{r.productName}</span>
                        <span className="block text-xs text-muted-foreground">{[r.variety, r.grade].filter(Boolean).join(' · ')}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-mono font-semibold">{formatAED(Number(r.priceAmount))}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.pricingUnit}</TableCell>
                      <TableCell><Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status || 'Published'}</Badge></TableCell>
                      <TableCell><FreshnessTag value={r.lastUpdated} /></TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={staleMutation.isPending}
                          onClick={() => staleMutation.mutate(r.id)}
                        >
                          <Clock3 className="h-3.5 w-3.5" /> Mark stale
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
