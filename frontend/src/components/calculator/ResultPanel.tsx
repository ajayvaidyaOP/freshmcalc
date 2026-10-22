'use client';

import * as React from 'react';
import { ChevronDown, FileDown, Loader2, Save, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatINR, formatNumber } from '@/lib/format';
import {
  GROUP_HINTS,
  GROUP_LABELS,
  type CalcResult,
  type CostGroup,
} from '@/lib/export-calc';
import { cn } from '@/lib/utils';

const GROUP_ORDER: CostGroup[] = ['PURCHASE', 'ORIGIN', 'FREIGHT', 'DESTINATION', 'COMMISSION_TAX'];
const GROUP_COLORS: Record<CostGroup, string> = {
  PURCHASE: 'bg-brand-600',
  ORIGIN: 'bg-brand-400',
  FREIGHT: 'bg-lime-400',
  DESTINATION: 'bg-amber-400',
  COMMISSION_TAX: 'bg-brand-200',
};

interface ResultPanelProps {
  result: CalcResult;
  saving?: boolean;
  onSave: () => void;
  onPreviewPdf: () => void;
  className?: string;
}

/** Live profit + landed-cost panel. Shared by desktop sidebar and mobile sheet. */
export function ResultPanel({ result, saving, onSave, onPreviewPdf, className }: ResultPanelProps) {
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const profitable = result.profitAed >= 0;
  const margin = Math.max(0, Math.min(100, result.marginPct));

  return (
    <Card className={cn('surface-forest overflow-hidden border-transparent text-white shadow-lift', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Wallet className="h-5 w-5 text-lime-300" /> Live profit
        </CardTitle>
        <p className="text-[11.5px] leading-relaxed text-brand-100/75">
          Every cost head below is included. Nothing is hidden until save.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-200/70">
                Estimated profit
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={cn(
                    'font-display text-[30px] font-extrabold leading-none',
                    profitable ? 'text-lime-300' : 'text-red-300'
                  )}
                >
                  {formatAED(result.profitAed, 0)}
                </span>
                {profitable ? (
                  <TrendingUp className="h-5 w-5 text-lime-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-200/70">Margin</p>
              <p className={cn('mt-1 font-display text-xl font-extrabold', profitable ? 'text-white' : 'text-red-300')}>
                {formatNumber(result.marginPct, 1)}%
              </p>
            </div>
          </div>

          <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                profitable ? 'bg-gradient-to-r from-brand-400 to-lime-300' : 'bg-red-400'
              )}
              style={{ width: `${Math.max(2, margin)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-brand-100/80">
            <span>Break-even · {formatAED(result.breakEvenPerBoxAed)}/box</span>
            <span className={cn('font-bold', profitable ? 'text-lime-300' : 'text-red-300')}>
              {profitable ? `+${formatAED(result.profitPerBoxAed)}/box` : `${formatAED(result.profitPerBoxAed)}/box`}
            </span>
          </div>
        </div>

        <dl className="space-y-2.5 text-sm">
          <Row label="Dubai sale value" value={formatAED(result.revenueAed, 0)} />
          <Row label="Total landed cost" value={formatAED(result.totalCostAed, 0)} />
          <div className="border-t border-dashed border-white/15 pt-2.5">
            <Row
              label="Profit per box"
              value={formatAED(result.profitPerBoxAed)}
              valueClass={profitable ? 'text-lime-300' : 'text-red-300'}
              strong
            />
          </div>
        </dl>

        <div>
          <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
            {GROUP_ORDER.map((group) => {
              const pct = result.totalCostAed > 0 ? (result.groupAed[group] / result.totalCostAed) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <span
                  key={group}
                  title={`${GROUP_LABELS[group]} · ${formatAED(result.groupAed[group], 0)}`}
                  className={cn('h-full', GROUP_COLORS[group])}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-brand-100/65">
            {GROUP_ORDER.filter((g) => result.groupAed[g] > 0).map((group) => (
              <span key={group} className="inline-flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', GROUP_COLORS[group])} />
                {GROUP_LABELS[group]}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Cost / box" value={formatAED(result.costPerBoxAed)} />
          <Stat label="Cost / kg" value={formatAED(result.costPerKgAed)} />
          <Stat label="Return on cost" value={`${formatNumber(result.roiPct, 1)}%`} />
          <Stat label="Total net wt." value={`${formatNumber(result.netWeightKg, 0)} kg`} />
        </div>

        <div className="space-y-2">
          <Button type="button" variant="lime" size="lg" className="w-full" onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Save cost sheet
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPreviewPdf}
            className="w-full text-brand-100/85 hover:bg-white/10 hover:text-white"
          >
            <FileDown className="h-4 w-4" /> Download PDF quotation
          </Button>
        </div>

        <div className="border-t border-white/10 pt-1">
          <button
            type="button"
            onClick={() => setBreakdownOpen((v) => !v)}
            aria-expanded={breakdownOpen}
            className="flex min-h-[36px] w-full items-center justify-between text-[12px] font-bold text-brand-100/85 hover:text-white"
          >
            Full cost breakdown
            <ChevronDown className={cn('h-4 w-4 transition-transform', breakdownOpen && 'rotate-180')} />
          </button>

          {breakdownOpen && (
            <div className="space-y-3 pb-1 animate-fade-in">
              {GROUP_ORDER.map((group) => {
                const lines = result.lines.filter((l) => l.group === group);
                if (group !== 'PURCHASE' && lines.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="mb-1 text-[10.5px] font-extrabold uppercase tracking-wide text-brand-200/60">
                      {GROUP_LABELS[group]}
                    </p>
                    <dl className="space-y-1">
                      {group === 'PURCHASE' && (
                        <LineRow
                          label="Goods purchased in India"
                          aed={result.purchaseAed}
                          inr={result.purchaseInr}
                        />
                      )}
                      {lines.map((line) => (
                        <LineRow key={line.id} label={line.name} aed={line.amountAed} inr={line.amountInr} />
                      ))}
                      <LineRow
                        label="Subtotal"
                        aed={result.groupAed[group]}
                        inr={result.groupInr[group]}
                        bold
                      />
                    </dl>
                    <p className="mt-0.5 text-[10px] leading-snug text-brand-200/45">{GROUP_HINTS[group]}</p>
                  </div>
                );
              })}
              <div className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-[11.5px] leading-relaxed text-brand-100/80">
                <p className="flex justify-between gap-3 font-bold text-white">
                  <span>Total landed cost</span>
                  <span>{formatAED(result.totalCostAed)}</span>
                </p>
                <p className="mt-0.5 flex justify-between gap-3">
                  <span className="text-brand-200/70">in INR</span>
                  <span>{formatINR(result.totalCostInr)}</span>
                </p>
                <p className="mt-2 flex justify-between gap-3">
                  <span>Dubai sale value</span>
                  <span>{formatAED(result.revenueAed)}</span>
                </p>
                <p className="mt-1 flex justify-between gap-3 border-t border-white/10 pt-1.5 font-bold text-lime-300">
                  <span>Profit</span>
                  <span>{formatAED(result.profitAed)}</span>
                </p>
              </div>
              <p className="text-[10px] leading-relaxed text-brand-200/45">
                Profit = Dubai sale value − purchase − all export costs. Percent costs use your FX rate (₹1 =
                AED {result.fx}). Figures are rounded; the saved sheet is calculated on the server with the same
                formula.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
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
      <dd className={cn('font-mono text-right text-[13.5px]', strong && 'font-semibold text-white', valueClass)}>
        {value}
      </dd>
    </div>
  );
}

function LineRow({
  label,
  aed,
  inr,
  bold,
}: {
  label: string;
  aed: number;
  inr: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn('min-w-0 truncate text-[11.5px] text-brand-100/75', bold && 'font-bold text-white')}>
        {label}
      </dt>
      <dd className="shrink-0 text-right">
        <span className={cn('block font-mono text-[11.5px]', bold ? 'font-bold text-white' : 'text-brand-50')}>
          {formatAED(aed, 0)}
        </span>
        <span className="block font-mono text-[9.5px] text-brand-200/45">{formatINR(inr, 0)}</span>
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-brand-200/60">{label}</p>
      <p className="mt-0.5 font-mono text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  );
}
