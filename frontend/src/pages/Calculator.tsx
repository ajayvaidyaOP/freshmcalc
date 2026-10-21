'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  Calculator as CalculatorIcon,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Save,
  Ship,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/layout/AuthLayout';
import { calculationsService } from '@/services/calculations.service';
import { apiError } from '@/lib/api';
import { formatAED, formatINR, formatNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const schema = z.object({
  product: z.string().min(1, 'Product is required'),
  variety: z.string().optional(),
  grade: z.string().optional(),
  packingCentre: z.string().optional(),
  originCity: z.string().min(1, 'Origin city is required'),
  originPort: z.string().min(1, 'Origin port is required'),
  destinationCountry: z.string().min(1, 'Destination country is required'),
  destinationCity: z.string().min(1, 'Destination city is required'),
  destinationPort: z.string().min(1, 'Destination port is required'),
  containerType: z.string().min(1),
  numberOfBoxes: z.coerce.number().positive('Must be greater than 0'),
  netWeightKg: z.coerce.number().positive('Must be greater than 0'),
  grossWeightKg: z.coerce.number().positive('Must be greater than 0'),
  productCostPerUnit: z.coerce.number().nonnegative('Cannot be negative'),
  productCostUnit: z.string().min(1),
  expectedDubaiSellingPricePerUnit: z.coerce.number().nonnegative('Cannot be negative'),
  expectedDubaiSellingPriceUnit: z.string().min(1),
  conversionRateInrToAed: z.coerce.number().positive('FX rate must be greater than 0'),
  conversionSource: z.string().optional(),
  assumptions: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  product: 'Pomegranate',
  variety: 'Wonderful',
  grade: 'Grade A',
  packingCentre: 'Solapur',
  originCity: 'Mumbai',
  originPort: 'JNPA / Nhava Sheva',
  destinationCountry: 'UAE',
  destinationCity: 'Dubai',
  destinationPort: 'Jebel Ali Port, Dubai',
  containerType: 'REEFER',
  numberOfBoxes: 1000,
  netWeightKg: 5000,
  grossWeightKg: 5500,
  productCostPerUnit: 450,
  productCostUnit: 'per box',
  expectedDubaiSellingPricePerUnit: 42.5,
  expectedDubaiSellingPriceUnit: 'per box',
  conversionRateInrToAed: 0.044,
  conversionSource: 'Manual (bank TT rate)',
  assumptions: '5 kg export carton · reefer container',
};

const PRESETS = [
  { product: 'Pomegranate', variety: 'Wonderful', cost: 450, sell: 42.5 },
  { product: 'Green Chilli', variety: 'G4', cost: 180, sell: 18.75 },
  { product: 'Banana', variety: 'Robusta', cost: 320, sell: 31 },
  { product: 'Mango', variety: 'Alphonso', cost: 1100, sell: 96 },
  { product: 'Grapes', variety: 'Thompson Seedless', cost: 380, sell: 38.25 },
  { product: 'Onion', variety: 'Red 55mm+', cost: 95, sell: 2.4 },
];

const CONTAINER_TYPES = [
  { value: 'REEFER', label: 'Reefer (temperature-controlled)' },
  { value: '20FT', label: '20 FT Dry' },
  { value: '40FT', label: '40 FT Dry' },
  { value: '40HC', label: '40 FT High Cube' },
];

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function Calculator() {
  const [saved, setSaved] = React.useState<any>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  const v = useWatch({ control });
  const boxes = num(v.numberOfBoxes);
  const netKg = num(v.netWeightKg);
  const fx = num(v.conversionRateInrToAed);

  const purchaseInr = v.productCostUnit === 'per kg' ? num(v.productCostPerUnit) * netKg : num(v.productCostPerUnit) * boxes;
  const purchaseAed = purchaseInr * fx;
  const revenueAed =
    v.expectedDubaiSellingPriceUnit === 'per kg'
      ? num(v.expectedDubaiSellingPricePerUnit) * netKg
      : num(v.expectedDubaiSellingPricePerUnit) * boxes;
  const grossBeforeExpenses = revenueAed - purchaseAed;
  const marginPct = revenueAed > 0 ? (grossBeforeExpenses / revenueAed) * 100 : 0;
  const profitable = grossBeforeExpenses >= 0;

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setValue('product', p.product, { shouldValidate: true });
    setValue('variety', p.variety);
    setValue('productCostPerUnit', p.cost);
    setValue('expectedDubaiSellingPricePerUnit', p.sell);
    toast({ title: `${p.product} preset loaded`, description: 'Example India cost & Dubai price filled in — adjust to your shipment.' });
  };

  const onSubmit = async (data: Values) => {
    setSaved(null);
    try {
      const res = await calculationsService.create(data);
      setSaved(res);
      toast({ title: 'Cost sheet saved', description: 'Your calculation snapshot is stored permanently.', variant: 'success' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      toast({ title: 'Could not save calculation', description: apiError(e, 'Save failed. Please try again.'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Export costing"
        title="India → Dubai Export Calculator"
        description="Build a complete cost sheet in INR, see your Dubai landed position in AED — live, as you type."
        actions={
          <Button type="button" variant="outline" onClick={() => { reset(DEFAULTS); setSaved(null); }}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        }
      />

      {saved && (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-4 animate-fade-in dark:border-brand-700 dark:bg-brand-950 sm:flex-row sm:items-center sm:p-5" role="status">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-brand-600 dark:text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold">Calculation saved{saved.referenceNumber ? ` · ${saved.referenceNumber}` : ''}</p>
            <p className="text-sm text-muted-foreground">
              {saved.totalLandedCostAed ? `Backend landed cost: ${formatAED(Number(saved.totalLandedCostAed))} · ` : ''}
              {saved.grossProfitAed ? `Gross profit: ${formatAED(Number(saved.grossProfitAed))} · ` : ''}
              Find it anytime under Saved Cost Sheets.
            </p>
          </div>
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <Link to="/calculations">View cost sheets <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      )}

      {/* Product presets */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Quick start — tap a product</p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.product}
              type="button"
              onClick={() => applyPreset(p)}
              className={cn(
                'min-h-[38px] shrink-0 rounded-full border px-4 text-[13px] font-bold transition-all active:scale-95',
                v.product === p.product
                  ? 'border-brand-700 bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-soft'
                  : 'border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-brand-800 dark:hover:border-brand-700 dark:hover:text-brand-200'
              )}
            >
              {p.product}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {/* Route strip */}
            <div className="surface-forest flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-white shadow-soft sm:gap-4 sm:px-5">
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate font-display text-sm font-bold sm:text-base">{v.originCity || 'Origin'}</p>
                <p className="truncate text-[11px] text-brand-200/75">{v.originPort || 'Origin port'} · India</p>
              </div>
              <div className="relative flex shrink-0 items-center" aria-hidden>
                <span className="h-px w-6 bg-gradient-to-r from-transparent to-lime-300/70 sm:w-12" />
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-brand-950 shadow-soft">
                  <Ship className="h-5 w-5" />
                </span>
                <span className="h-px w-6 bg-gradient-to-l from-transparent to-lime-300/70 sm:w-12" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold sm:text-base">{v.destinationCity || 'Dubai'}</p>
                <p className="truncate text-[11px] text-brand-200/75">{v.destinationPort || 'Jebel Ali'} · Selling market (AED)</p>
              </div>
            </div>

            <SectionCard step={1} icon={Package} title="Product & packing" desc="What are you shipping?">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Product" htmlFor="product" error={errors.product?.message}>
                  <Input id="product" {...register('product')} />
                </FormField>
                <FormField label="Packing centre" htmlFor="packingCentre">
                  <Input id="packingCentre" placeholder="e.g. Solapur, Nashik" {...register('packingCentre')} />
                </FormField>
                <FormField label="Variety" htmlFor="variety">
                  <Input id="variety" placeholder="e.g. Wonderful, G4" {...register('variety')} />
                </FormField>
                <FormField label="Grade" htmlFor="grade">
                  <Input id="grade" placeholder="e.g. Grade A" {...register('grade')} />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard step={2} icon={MapPin} title="Route & container" desc="India origin → Dubai destination">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Origin city (India)" htmlFor="originCity" error={errors.originCity?.message}>
                  <Input id="originCity" {...register('originCity')} />
                </FormField>
                <FormField label="Origin port" htmlFor="originPort" error={errors.originPort?.message}>
                  <Input id="originPort" {...register('originPort')} />
                </FormField>
                <FormField label="Destination country" htmlFor="destinationCountry" error={errors.destinationCountry?.message}>
                  <Input id="destinationCountry" {...register('destinationCountry')} />
                </FormField>
                <FormField label="Destination city" htmlFor="destinationCity" error={errors.destinationCity?.message}>
                  <Input id="destinationCity" {...register('destinationCity')} />
                </FormField>
                <FormField label="Destination port" htmlFor="destinationPort" error={errors.destinationPort?.message}>
                  <Input id="destinationPort" {...register('destinationPort')} />
                </FormField>
                <FormField label="Container type" htmlFor="containerType">
                  <Controller
                    control={control}
                    name="containerType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="containerType">
                          <SelectValue placeholder="Select container" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTAINER_TYPES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard step={3} icon={Boxes} title="Quantity & weight" desc="Boxes and weights for this shipment">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Number of boxes" htmlFor="numberOfBoxes" error={errors.numberOfBoxes?.message}>
                  <Input id="numberOfBoxes" type="number" inputMode="numeric" min={1} {...register('numberOfBoxes')} />
                </FormField>
                <FormField label="Net weight (kg)" htmlFor="netWeightKg" error={errors.netWeightKg?.message} hint={boxes > 0 && netKg > 0 ? `≈ ${formatNumber(netKg / boxes, 1)} kg per box` : undefined}>
                  <Input id="netWeightKg" type="number" inputMode="decimal" min={0} {...register('netWeightKg')} />
                </FormField>
                <FormField label="Gross weight (kg)" htmlFor="grossWeightKg" error={errors.grossWeightKg?.message}>
                  <Input id="grossWeightKg" type="number" inputMode="decimal" min={0} {...register('grossWeightKg')} />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard step={4} icon={BadgeIndianRupee} title="Pricing & currency" desc="India purchase cost vs expected Dubai selling price">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Product cost (INR per unit)" htmlFor="productCostPerUnit" error={errors.productCostPerUnit?.message}>
                  <Input id="productCostPerUnit" type="number" inputMode="decimal" min={0} step="any" {...register('productCostPerUnit')} />
                </FormField>
                <FormField label="Cost unit" htmlFor="productCostUnit">
                  <Controller
                    control={control}
                    name="productCostUnit"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="productCostUnit"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per box">Per box</SelectItem>
                          <SelectItem value="per kg">Per kg</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="Expected Dubai sell price (AED per unit)" htmlFor="expectedDubaiSellingPricePerUnit" error={errors.expectedDubaiSellingPricePerUnit?.message}>
                  <Input id="expectedDubaiSellingPricePerUnit" type="number" inputMode="decimal" min={0} step="any" {...register('expectedDubaiSellingPricePerUnit')} />
                </FormField>
                <FormField label="Sell price unit" htmlFor="expectedDubaiSellingPriceUnit">
                  <Controller
                    control={control}
                    name="expectedDubaiSellingPriceUnit"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="expectedDubaiSellingPriceUnit"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per box">Per box</SelectItem>
                          <SelectItem value="per kg">Per kg</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField label="FX rate — 1 INR in AED" htmlFor="conversionRateInrToAed" error={errors.conversionRateInrToAed?.message} hint={fx > 0 ? `₹100 = AED ${formatNumber(100 * fx, 2)}` : undefined}>
                  <Input id="conversionRateInrToAed" type="number" inputMode="decimal" min={0} step="0.0001" {...register('conversionRateInrToAed')} />
                </FormField>
                <FormField label="FX source" htmlFor="conversionSource">
                  <Input id="conversionSource" placeholder="e.g. Bank TT rate" {...register('conversionSource')} />
                </FormField>
                <FormField label="Assumptions / notes" htmlFor="assumptions" className="sm:col-span-2">
                  <Textarea id="assumptions" rows={2} placeholder="Packing specs, buyer terms, anything your future self should remember…" {...register('assumptions')} />
                </FormField>
              </div>
            </SectionCard>
          </div>

          {/* Live estimate */}
          <aside className="space-y-4 lg:sticky lg:top-[92px]">
            <Card className="surface-forest overflow-hidden border-transparent text-white shadow-lift">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Wallet className="h-5 w-5 text-lime-300" /> Live estimate
                </CardTitle>
                <p className="text-xs leading-relaxed text-brand-200/75">
                  Purchase-cost preview. Freight, CHA, duties & commission are computed by the backend on save.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-200/70">Est. margin before expenses</p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className={cn('font-display text-[32px] font-extrabold leading-none', profitable ? 'text-lime-300' : 'text-red-300')}>
                      {formatNumber(marginPct, 1)}%
                    </span>
                    {profitable ? <TrendingUp className="h-5 w-5 text-lime-300" /> : <TrendingDown className="h-5 w-5 text-red-300" />}
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', profitable ? 'bg-gradient-to-r from-brand-400 to-lime-300' : 'bg-red-400')}
                      style={{ width: `${Math.min(100, Math.max(2, Math.abs(marginPct)))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-brand-200/75">
                    {profitable ? 'Healthy buffer for freight & expenses.' : 'Purchase cost already exceeds Dubai revenue — recheck prices.'}
                  </p>
                </div>

                <dl className="space-y-2.5 text-sm">
                  <EstimateRow label="Product purchase (INR)" value={formatINR(purchaseInr)} />
                  <EstimateRow label="Purchase cost in AED" value={formatAED(purchaseAed)} />
                  <EstimateRow label="Expected Dubai revenue" value={formatAED(revenueAed)} strong />
                  <div className="border-t border-dashed border-white/15 pt-2.5">
                    <EstimateRow
                      label="Gross before expenses"
                      value={formatAED(grossBeforeExpenses)}
                      valueClass={profitable ? 'text-lime-300' : 'text-red-300'}
                      strong
                    />
                  </div>
                  <EstimateRow label="Purchase / box" value={boxes > 0 ? formatAED(purchaseAed / boxes) : '—'} />
                  <EstimateRow label="Purchase / kg" value={netKg > 0 ? formatAED(purchaseAed / netKg) : '—'} />
                </dl>

                <Button type="submit" variant="lime" size="lg" className="hidden w-full lg:flex" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="h-5 w-5" /> Save cost sheet</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2.5 rounded-2xl border border-border/80 bg-card p-4 text-[13px] leading-relaxed text-muted-foreground shadow-soft">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <p>
                Final costing (freight, insurance, CHA, duties, commission) is calculated by the FreshmCalc backend
                with full decimal precision and saved as a permanent snapshot with a reference number.
              </p>
            </div>
          </aside>
        </div>

        {/* Mobile / tablet sticky save bar (sits above the bottom nav on phones) */}
        <div className="glass fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+57px)] z-30 border-t border-border/80 px-4 py-3 md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Est. margin</p>
              <p className={cn('font-display text-lg font-extrabold', profitable ? 'text-brand-700 dark:text-brand-300' : 'text-red-500')}>
                {formatNumber(marginPct, 1)}% · {formatAED(grossBeforeExpenses, 0)}
              </p>
            </div>
            <Button type="submit" size="lg" className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save cost sheet
            </Button>
          </div>
        </div>
        {/* Spacer so the sticky bar never covers content on small screens */}
        <div className="h-20 lg:hidden" aria-hidden />
      </form>
    </div>
  );
}

function SectionCard({
  step,
  icon: Icon,
  title,
  desc,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3.5 space-y-0 pb-4">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
          <Icon className="h-5 w-5" />
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 font-display text-[10px] font-extrabold text-white ring-2 ring-card">
            {step}
          </span>
        </span>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-[13px] text-muted-foreground">{desc}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EstimateRow({
  label,
  value,
  strong,
  valueClass,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-brand-100/80">{label}</dt>
      <dd className={cn('font-mono text-right text-[13.5px]', strong ? 'font-semibold text-white' : 'text-brand-50', valueClass)}>{value}</dd>
    </div>
  );
}
