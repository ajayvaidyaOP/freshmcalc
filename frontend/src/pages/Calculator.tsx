'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Package,
  RotateCcw,
  Save,
  Ship,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { PlanLock } from '@/components/common/PlanLock';
import { CostLinesEditor } from '@/components/calculator/CostLinesEditor';
import { ResultPanel } from '@/components/calculator/ResultPanel';
import { ratesService } from '@/services/rates.service';
import { calculationsService } from '@/services/calculations.service';
import { apiError } from '@/lib/api';
import { generateQuotationPdf } from '@/lib/pdf';
import { isNativeApp } from '@/lib/platform';
import { formatAED, formatINR, formatNumber } from '@/lib/format';
import {
  DEFAULT_FX,
  calculateExport,
  toBackendItems,
  type CostLine,
  type PriceUnit,
} from '@/lib/export-calc';
import { PRODUCT_PRESETS, defaultCostLines } from '@/lib/expense-presets';
import { toast } from '@/hooks/use-toast';
import { hasFeature } from '@/components/layout/nav-items';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ form */

interface FormState {
  product: string;
  variety: string;
  grade: string;
  packingCentre: string;
  originCity: string;
  originPort: string;
  destinationCountry: string;
  destinationCity: string;
  destinationPort: string;
  containerType: string;
  boxes: string;
  kgPerBox: string;
  grossWeightKg: string;
  productCost: string;
  productCostUnit: PriceUnit;
  sellingPrice: string;
  sellingPriceUnit: PriceUnit;
  fx: string;
  fxSource: string;
  assumptions: string;
  lines: CostLine[];
}

const DEFAULTS: FormState = {
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
  boxes: '2200',
  kgPerBox: '5',
  grossWeightKg: '',
  productCost: '450',
  productCostUnit: 'per box',
  sellingPrice: '42.5',
  sellingPriceUnit: 'per box',
  fx: String(DEFAULT_FX),
  fxSource: 'Bank TT rate',
  assumptions: '5 kg export carton · reefer container',
  lines: defaultCostLines(),
};

const DRAFT_KEY = 'freshmcalc_calculator_draft_v3';

const num = (value: string | number | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return {
      ...DEFAULTS,
      ...parsed,
      lines: Array.isArray(parsed.lines) && parsed.lines.length > 0 ? (parsed.lines as CostLine[]) : defaultCostLines(),
    };
  } catch {
    return DEFAULTS;
  }
}

/* ------------------------------------------------------------------ page */

export default function Calculator() {
  const user = useCurrentUser();
  const calculatorAllowed = hasFeature(user, 'calculatorAccess');
  const pdfAllowed = hasFeature(user, 'pdfExportAccess');
  const savedSheetsAllowed = hasFeature(user, 'savedCalculationsAccess');
  const [form, setForm] = React.useState<FormState>(() => loadDraft());
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<any>(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const { data: rates = [] } = useQuery({
    queryKey: ['rates'],
    queryFn: ratesService.listPublished,
    enabled: calculatorAllowed && hasFeature(user, 'dubaiRatesAccess'),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const boxes = Math.max(0, Math.floor(num(form.boxes)));
  const kgPerBox = Math.max(0, num(form.kgPerBox));
  const fx = num(form.fx) || DEFAULT_FX;

  const result = React.useMemo(
    () =>
      calculateExport({
        boxes,
        kgPerBox,
        grossWeightKg: num(form.grossWeightKg),
        productCost: num(form.productCost),
        productCostUnit: form.productCostUnit,
        sellingPrice: num(form.sellingPrice),
        sellingPriceUnit: form.sellingPriceUnit,
        fx,
        lines: form.lines,
      }),
    [boxes, kgPerBox, form.grossWeightKg, form.productCost, form.productCostUnit, form.sellingPrice, form.sellingPriceUnit, fx, form.lines]
  );

  // Keep a draft on the device — switching apps on a phone should never lose a costing.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {
        /* storage full / private mode — not fatal */
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [form]);

  const liveRate = React.useMemo(() => {
    const needle = form.product.trim().toLowerCase();
    if (!needle) return null;
    const match = (rates as any[]).find((r) => (r.productName || '').toLowerCase() === needle);
    return match || (rates as any[]).find((r) => (r.productName || '').toLowerCase().includes(needle)) || null;
  }, [rates, form.product]);

  const applyPreset = (preset: (typeof PRODUCT_PRESETS)[number]) => {
    setForm((current) => ({
      ...current,
      product: preset.product,
      variety: preset.variety,
      grade: preset.grade,
      productCost: String(preset.costPerBox),
      productCostUnit: 'per box',
      sellingPrice: String(preset.sellPerBox),
      sellingPriceUnit: 'per box',
      kgPerBox: String(preset.kgPerBox),
    }));
    toast({
      title: `${preset.product} example loaded`,
      description: 'Sample India cost and Dubai price filled in — replace with your own numbers.',
    });
  };

  const useLiveRate = () => {
    if (!liveRate) return;
    const unit: PriceUnit = (liveRate.pricingUnit || '').toLowerCase().includes('kg') ? 'per kg' : 'per box';
    set('sellingPrice', String(liveRate.priceAmount));
    set('sellingPriceUnit', unit);
    toast({
      title: 'Dubai live rate applied',
      description: `AED ${formatNumber(liveRate.priceAmount, 2)} ${unit}${liveRate.variety ? ` · ${liveRate.variety}` : ''}`,
      variant: 'success',
    });
  };

  const updateLine = (id: string, patch: Partial<CostLine>) =>
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }));

  const resetAll = () => {
    setForm({ ...DEFAULTS, lines: defaultCostLines() });
    setSaved(null);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    toast({ title: 'Calculator reset', description: 'Back to the example shipment.' });
  };

  const validate = (): string | null => {
    if (!form.product.trim()) return 'Enter the product you are exporting.';
    if (boxes <= 0) return 'Enter the number of boxes (at least 1).';
    if (kgPerBox <= 0) return 'Enter the weight of one box in kg.';
    if (num(form.productCost) <= 0) return 'Enter your purchase cost in India.';
    if (num(form.sellingPrice) <= 0) return 'Enter your expected Dubai selling price.';
    if (fx <= 0) return 'Enter a valid INR → AED exchange rate.';
    return null;
  };

  const buildPayload = () => ({
    product: form.product.trim(),
    variety: form.variety.trim() || null,
    grade: form.grade.trim() || null,
    packingCentre: form.packingCentre.trim() || null,
    originCity: form.originCity.trim(),
    originPort: form.originPort.trim(),
    destinationCountry: form.destinationCountry.trim() || 'UAE',
    destinationCity: form.destinationCity.trim() || 'Dubai',
    destinationPort: form.destinationPort.trim(),
    containerType: form.containerType,
    numberOfBoxes: boxes,
    netWeightKg: result.netWeightKg,
    grossWeightKg: result.grossWeightKg,
    productCostPerUnit: num(form.productCost),
    productCostUnit: form.productCostUnit,
    expectedDubaiSellingPricePerUnit: num(form.sellingPrice),
    expectedDubaiSellingPriceUnit: form.sellingPriceUnit,
    conversionRateInrToAed: fx,
    conversionSource: form.fxSource.trim() || 'Manual',
    assumptions: form.assumptions.trim() || null,
    items: toBackendItems(result),
  });

  const onSave = async () => {
    if (!savedSheetsAllowed) {
      toast({ title: 'Plan required to save', description: 'Activate a plan with saved cost-sheet access.', variant: 'destructive' });
      return;
    }
    const problem = validate();
    if (problem) {
      toast({ title: 'Check your shipment', description: problem, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const response = await calculationsService.create(buildPayload());
      setSaved(response);
      toast({
        title: 'Cost sheet saved',
        description: response?.referenceNumber
          ? `Reference ${response.referenceNumber} — ready to export as a PDF.`
          : 'Your calculation is saved with a permanent reference number.',
        variant: 'success',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        toast({
          title: 'Plan required to save',
          description:
            'Your costing is ready — activate a plan to save it with a reference number and re-open it any time from Saved sheets.',
          variant: 'destructive',
        });
      } else if (status === 401) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again, then save your sheet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Could not save',
          description: apiError(error, 'Save failed. Please try again.'),
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const onPreviewPdf = async () => {
    if (!pdfAllowed) {
      toast({ title: 'Plan required for PDF export', description: 'Activate a plan with PDF quotation access.', variant: 'destructive' });
      return;
    }
    const problem = validate();
    if (problem) {
      toast({ title: 'Complete the shipment first', description: problem, variant: 'destructive' });
      return;
    }
    try {
      await generateQuotationPdf({
        referenceNumber: saved?.referenceNumber || 'DRAFT',
        product: form.product,
        variety: form.variety,
        grade: form.grade,
        originPort: form.originPort,
        destinationPort: form.destinationPort,
        containerType: form.containerType,
        numberOfBoxes: boxes,
        netWeightKg: result.netWeightKg,
        conversionRateInrToAed: fx,
        totalPurchaseInr: result.purchaseInr,
        totalOriginInr: result.groupInr.ORIGIN,
        totalFreightInr: result.groupInr.FREIGHT,
        totalDestinationInr: result.groupInr.DESTINATION,
        totalCommissionTaxInr: result.groupInr.COMMISSION_TAX,
        totalShipmentCostInr: result.totalCostInr,
        totalLandedCostAed: result.totalCostAed,
        costPerBoxAed: result.costPerBoxAed,
        costPerKgAed: result.costPerKgAed,
        costPerTonneAed: result.costPerTonneAed,
        expectedRevenueAed: result.revenueAed,
        grossProfitAed: result.profitAed,
        profitMarginPercent: result.marginPct,
        items: [
          {
            name: 'Product purchase',
            group: 'PURCHASE',
            amountInr: result.purchaseInr,
            amountAed: result.purchaseAed,
          },
          ...result.lines.map((line) => ({
            name: line.name,
            group: line.group,
            amountInr: line.amountInr,
            amountAed: line.amountAed,
          })),
        ],
        createdAt: new Date().toISOString(),
      });
      toast({
        title: isNativeApp() ? 'Quotation ready to share' : 'Quotation PDF downloaded',
        description: 'Draft costing with the full breakdown.',
      });
    } catch {
      toast({ title: 'PDF export failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const enabledCosts = form.lines.filter((line) => line.enabled).length;
  const profitable = result.profitAed >= 0;

  if (!calculatorAllowed) {
    return (
      <PlanLock
        title="Export calculator access needs an active plan"
        description="Subscribe or renew to calculate India → Dubai landed costs and profit with your shipment inputs."
        benefits={['Complete export cost breakdown', 'Saved cost sheets with references', 'PDF quotations for buyers']}
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="India → Dubai"
        title="Export calculator"
        description="Purchase, packing, CHA, freight, duty, commission — one simple sheet, live profit in AED."
        actions={
          <Button type="button" variant="outline" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        }
      />

      {saved && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-4 animate-fade-in dark:border-brand-700 dark:bg-brand-950 sm:flex-row sm:items-center sm:p-5"
        >
          <CheckCircle2 className="h-8 w-8 shrink-0 text-brand-600 dark:text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold">
              Cost sheet saved{saved.referenceNumber ? ` · ${saved.referenceNumber}` : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              {saved.totalLandedCostAed
                ? `Server landed cost ${formatAED(Number(saved.totalLandedCostAed))} · `
                : ''}
              {saved.grossProfitAed
                ? `Gross profit ${formatAED(Number(saved.grossProfitAed))} · `
                : ''}
              Every cost head is stored with it.
            </p>
          </div>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={() => setSaved(null)} className="flex-1 sm:flex-none">
              Stay here
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link to="/calculations">
                Saved sheets <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Route strip */}
      <div className="surface-forest flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-white shadow-soft sm:gap-4 sm:px-5">
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate font-display text-sm font-bold sm:text-base">{form.originCity || 'Origin'}</p>
          <p className="truncate text-[11px] text-brand-200/70">{form.originPort || 'Origin port'} · India</p>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden>
          <span className="h-px w-5 bg-gradient-to-r from-transparent to-lime-300/70 sm:w-10" />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-brand-950">
            <Ship className="h-[18px] w-[18px]" />
          </span>
          <span className="h-px w-5 bg-gradient-to-l from-transparent to-lime-300/70 sm:w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold sm:text-base">{form.destinationCity || 'Dubai'}</p>
          <p className="truncate text-[11px] text-brand-200/70">Selling market · prices in AED</p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_392px]">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* Step 1 — shipment */}
          <StepCard step={1} icon={Package} title="Your shipment" hint="What are you sending?">
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Quick start
              </p>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {PRODUCT_PRESETS.map((preset) => (
                  <button
                    key={preset.product}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'min-h-[38px] shrink-0 rounded-full border px-3.5 text-[12.5px] font-bold transition-all active:scale-95',
                      form.product === preset.product
                        ? 'border-brand-700 bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-soft'
                        : 'border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-brand-800 dark:hover:border-brand-700 dark:hover:text-brand-200'
                    )}
                  >
                    {preset.product}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Product" htmlFor="product" hint="Free text — anything you export">
                <Input
                  id="product"
                  value={form.product}
                  onChange={(e) => set('product', e.target.value)}
                  placeholder="e.g. Pomegranate"
                  list="freshmcalc-products"
                  autoComplete="off"
                />
                <datalist id="freshmcalc-products">
                  {PRODUCT_PRESETS.map((p) => (
                    <option key={p.product} value={p.product} />
                  ))}
                </datalist>
              </Field>

              <Field label="Purchase cost in India" htmlFor="productCost" hint="What you pay per box or per kg">
                <MoneyInput
                  id="productCost"
                  currency="₹"
                  value={form.productCost}
                  onChange={(value) => set('productCost', value)}
                  suffix={form.productCostUnit === 'per box' ? '/box' : '/kg'}
                />
              </Field>

              <Field label="Boxes in this shipment" htmlFor="boxes">
                <Input
                  id="boxes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={form.boxes}
                  onChange={(e) => set('boxes', e.target.value)}
                />
              </Field>

              <Field label="Weight per box" htmlFor="kgPerBox" hint={`≈ ${formatNumber(boxes * kgPerBox, 0)} kg net`}>
                <MoneyInput
                  id="kgPerBox"
                  value={form.kgPerBox}
                  onChange={(value) => set('kgPerBox', value)}
                  suffix="kg"
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cost unit</span>
              <UnitToggle
                value={form.productCostUnit}
                onChange={(unit) => set('productCostUnit', unit)}
                options={[
                  { value: 'per box', label: 'Per box' },
                  { value: 'per kg', label: 'Per kg' },
                ]}
              />
              <span className="ml-auto text-[11.5px] font-semibold text-muted-foreground">
                {formatNumber(result.netWeightKg, 0)} kg net · {formatNumber(result.grossWeightKg, 0)} kg gross
              </span>
            </div>
          </StepCard>

          {/* Step 2 — Dubai price */}
          <StepCard
            step={2}
            icon={BadgeIndianRupee}
            title="Your Dubai selling price"
            hint="Always a Dubai market price, in AED"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Expected selling price" htmlFor="sellingPrice">
                <MoneyInput
                  id="sellingPrice"
                  currency="AED"
                  value={form.sellingPrice}
                  onChange={(value) => set('sellingPrice', value)}
                  suffix={form.sellingPriceUnit === 'per box' ? '/box' : '/kg'}
                  large
                />
              </Field>
              <div className="flex flex-col justify-end gap-2 pb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Price unit</span>
                <UnitToggle
                  value={form.sellingPriceUnit}
                  onChange={(unit) => set('sellingPriceUnit', unit)}
                  options={[
                    { value: 'per box', label: 'Per box' },
                    { value: 'per kg', label: 'Per kg' },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200/70 bg-brand-50/70 px-3 py-2.5 dark:border-brand-800 dark:bg-brand-950/40">
              <TrendingUp className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              {liveRate ? (
                <>
                  <p className="min-w-0 flex-1 text-[12px] leading-snug text-brand-900/80 dark:text-brand-100/80">
                    Dubai live rate:{' '}
                    <strong>
                      AED {formatNumber(liveRate.priceAmount, 2)} {liveRate.pricingUnit}
                    </strong>
                    {liveRate.variety ? ` · ${liveRate.variety}` : ''}
                  </p>
                  <Button type="button" size="sm" variant="outline" onClick={useLiveRate} className="shrink-0">
                    Use rate
                  </Button>
                </>
              ) : (
                <p className="text-[12px] leading-snug text-brand-900/70 dark:text-brand-100/70">
                  No published Dubai rate for “{form.product || 'this product'}” yet — type your buyer's price.
                </p>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="Sale value" value={formatAED(result.revenueAed, 0)} />
              <MiniStat
                label="After all costs"
                value={formatAED(result.profitAed, 0)}
                tone={profitable ? 'positive' : 'negative'}
                hint={`${formatNumber(result.marginPct, 1)}% margin`}
              />
            </div>
          </StepCard>

          {/* Step 3 — costs */}
          <StepCard
            step={3}
            icon={Wallet}
            title="Your export costs"
            hint={`${enabledCosts} of ${form.lines.length} active — edit any amount`}
          >
            <CostLinesEditor
              lines={form.lines}
              results={result.lines}
              fx={fx}
              onUpdate={updateLine}
              onAdd={(line) => setForm((current) => ({ ...current, lines: [...current.lines, line] }))}
              onRemove={(id) => setForm((current) => ({ ...current, lines: current.lines.filter((l) => l.id !== id) }))}
              onReset={() =>
                setForm((current) => ({
                  ...current,
                  lines: defaultCostLines(),
                }))
              }
            />

            <div className="mt-3.5 space-y-1.5 rounded-xl bg-muted/60 px-3.5 py-3 text-[12.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Goods + all export costs (INR)</span>
                <span className="font-mono font-bold">{formatINR(result.totalCostInr, 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Total landed cost (AED)</span>
                <span className="font-mono font-bold">{formatAED(result.totalCostAed, 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-brand-700 dark:text-brand-300">
                <span className="font-semibold">Dubai sale value (AED)</span>
                <span className="font-mono font-bold">{formatAED(result.revenueAed, 0)}</span>
              </div>
            </div>
          </StepCard>

          {/* Advanced */}
          <Card>
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Info className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[14.5px] font-bold">Route & advanced details</span>
                <span className="block text-[12px] text-muted-foreground">
                  Ports, container, FX rate, variety, notes — optional
                </span>
              </span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', advancedOpen && 'rotate-180')} />
            </button>
            {advancedOpen && (
              <CardContent className="animate-fade-in space-y-3.5 border-t border-border/70 pt-4">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Origin city" htmlFor="originCity">
                    <Input id="originCity" value={form.originCity} onChange={(e) => set('originCity', e.target.value)} />
                  </Field>
                  <Field label="Origin port" htmlFor="originPort">
                    <Input id="originPort" value={form.originPort} onChange={(e) => set('originPort', e.target.value)} />
                  </Field>
                  <Field label="Destination city" htmlFor="destinationCity">
                    <Input
                      id="destinationCity"
                      value={form.destinationCity}
                      onChange={(e) => set('destinationCity', e.target.value)}
                    />
                  </Field>
                  <Field label="Destination port" htmlFor="destinationPort">
                    <Input
                      id="destinationPort"
                      value={form.destinationPort}
                      onChange={(e) => set('destinationPort', e.target.value)}
                    />
                  </Field>
                  <Field label="Container" htmlFor="containerType">
                    <Select value={form.containerType} onValueChange={(value) => set('containerType', value)}>
                      <SelectTrigger id="containerType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REEFER">Reefer (temperature controlled)</SelectItem>
                        <SelectItem value="20FT">20 FT dry</SelectItem>
                        <SelectItem value="40FT">40 FT dry</SelectItem>
                        <SelectItem value="40HC">40 FT high cube</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Packing centre" htmlFor="packingCentre">
                    <Input
                      id="packingCentre"
                      value={form.packingCentre}
                      onChange={(e) => set('packingCentre', e.target.value)}
                    />
                  </Field>
                  <Field label="Variety" htmlFor="variety">
                    <Input id="variety" value={form.variety} onChange={(e) => set('variety', e.target.value)} />
                  </Field>
                  <Field label="Grade" htmlFor="grade">
                    <Input id="grade" value={form.grade} onChange={(e) => set('grade', e.target.value)} />
                  </Field>
                  <Field label="FX rate — 1 INR in AED" htmlFor="fx" hint={`₹100 = AED ${formatNumber(fx * 100, 2)}`}>
                    <Input
                      id="fx"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.0001"
                      value={form.fx}
                      onChange={(e) => set('fx', e.target.value)}
                    />
                  </Field>
                  <Field label="FX source" htmlFor="fxSource">
                    <Input
                      id="fxSource"
                      value={form.fxSource}
                      onChange={(e) => set('fxSource', e.target.value)}
                      placeholder="Bank TT rate"
                    />
                  </Field>
                  <Field label="Gross weight (kg)" htmlFor="grossWeightKg" hint="Optional — defaults to net + 6%">
                    <Input
                      id="grossWeightKg"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={form.grossWeightKg}
                      onChange={(e) => set('grossWeightKg', e.target.value)}
                      placeholder={String(result.grossWeightKg || '')}
                    />
                  </Field>
                  <Field label="Notes / assumptions" htmlFor="assumptions" className="sm:col-span-2">
                    <Textarea
                      id="assumptions"
                      rows={2}
                      value={form.assumptions}
                      onChange={(e) => set('assumptions', e.target.value)}
                      placeholder="Packing specs, buyer terms, anything to remember…"
                    />
                  </Field>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Mobile result card */}
          <div className="lg:hidden">
            <ResultPanel result={result} saving={saving} onSave={onSave} onPreviewPdf={onPreviewPdf} />
          </div>

          <p className="flex items-start gap-2 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
            Cost heads are editable starting points based on a typical reefer shipment. Replace them with your
            freight forwarder and CHA quotations for an exact sheet.
          </p>
        </div>

        {/* Desktop live result */}
        <aside className="hidden lg:sticky lg:top-[88px] lg:block">
          <ResultPanel result={result} saving={saving} onSave={onSave} onPreviewPdf={onPreviewPdf} />
        </aside>
      </div>

      {/* Mobile sticky summary (above the bottom tab bar) */}
      <div className="glass fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+57px)] z-30 border-t border-border/80 px-4 py-2.5 lg:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Profit · {formatNumber(result.marginPct, 1)}% margin
            </p>
            <p
              className={cn(
                'font-display text-[19px] font-extrabold leading-tight',
                profitable ? 'text-brand-700 dark:text-brand-300' : 'text-red-500'
              )}
            >
              {formatAED(result.profitAed, 0)}
              <span className="ml-1.5 font-sans text-[10.5px] font-semibold text-muted-foreground">
                / {formatAED(result.totalCostAed, 0)} cost
              </span>
            </p>
          </div>
          <Button type="button" size="lg" onClick={onSave} disabled={saving} className="shrink-0">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
            Save
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

function StepCard({
  step,
  icon: Icon,
  title,
  hint,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3.5">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
          <Icon className="h-[18px] w-[18px]" />
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 font-display text-[10px] font-extrabold text-white ring-2 ring-card">
            {step}
          </span>
        </span>
        <div className="min-w-0">
          <CardTitle className="text-[16px] leading-tight">{title}</CardTitle>
          <CardDescription className="text-[12px] leading-snug">{hint}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[12.5px] font-bold leading-none">
        {label}
      </label>
      {children}
      {hint && <p className="truncate text-[10.5px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MoneyInput({
  id,
  value,
  onChange,
  currency,
  suffix,
  large,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  suffix?: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center rounded-xl border border-input bg-card shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15',
        large ? 'h-12' : 'h-11'
      )}
    >
      {currency && (
        <span
          className={cn(
            'pl-3.5 font-display text-[13px] font-bold text-muted-foreground',
            large && 'text-[15px]'
          )}
        >
          {currency}
        </span>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-full w-full min-w-0 flex-1 border-0 bg-transparent px-2 font-semibold outline-none placeholder:text-muted-foreground/60',
          large ? 'text-[20px]' : 'text-[15px]'
        )}
      />
      {suffix && <span className="pr-3 text-[11.5px] font-bold text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function UnitToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-0.5" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'min-h-[30px] rounded-[7px] px-2.5 text-[11.5px] font-bold transition-all',
            value === option.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'positive' | 'negative';
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-3 py-2">
      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-0.5 font-mono text-[13.5px] font-bold',
          tone === 'positive' && 'text-brand-700 dark:text-brand-300',
          tone === 'negative' && 'text-red-500'
        )}
      >
        {value}
      </p>
      {hint && <p className="text-[9.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
