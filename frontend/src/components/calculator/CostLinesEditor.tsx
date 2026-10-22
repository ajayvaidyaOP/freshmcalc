'use client';

import * as React from 'react';
import { ChevronDown, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatAED, formatINR } from '@/lib/format';
import { GROUP_LABELS, type CostGroup, type CostLine, type CostLineResult } from '@/lib/export-calc';
import { cn } from '@/lib/utils';

type EditableGroup = Exclude<CostGroup, 'PURCHASE'>;

interface CostLinesEditorProps {
  lines: CostLine[];
  results: CostLineResult[];
  fx: number;
  onUpdate: (id: string, patch: Partial<CostLine>) => void;
  onAdd: (line: CostLine) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

/**
 * Editable list of export cost heads.
 * Amount lines can be per shipment or per box; percent lines show the rupee
 * value they worked out to, so nothing is a black box.
 */
export function CostLinesEditor({
  lines,
  results,
  fx,
  onUpdate,
  onAdd,
  onRemove,
  onReset,
}: CostLinesEditorProps) {
  const [showOptional, setShowOptional] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);

  const resultById = React.useMemo(() => new Map(results.map((r) => [r.id, r])), [results]);
  const enabled = lines.filter((l) => l.enabled);
  const optional = lines.filter((l) => !l.enabled);
  const activeTotalAed = enabled.reduce((sum, l) => sum + (resultById.get(l.id)?.amountAed ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-muted-foreground">
          {enabled.length} active · approx{' '}
          <span className="font-bold text-foreground">{formatAED(activeTotalAed, 0)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add cost
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card">
        {enabled.map((line) => (
          <CostRow
            key={line.id}
            line={line}
            result={resultById.get(line.id)}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={Boolean(line.custom)}
          />
        ))}
        {enabled.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            All cost heads are off. Turn some on below, or add your own.
          </li>
        )}
      </ul>

      {optional.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            aria-expanded={showOptional}
            className="flex min-h-[40px] w-full items-center justify-between rounded-xl px-2 text-[13px] font-bold text-brand-700 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/40"
          >
            <span>
              {optional.length} optional cost{optional.length > 1 ? 's' : ''} not included
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', showOptional && 'rotate-180')} />
          </button>
          {showOptional && (
            <ul className="mt-1 divide-y divide-border/70 overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 animate-fade-in">
              {optional.map((line) => (
                <CostRow
                  key={line.id}
                  line={line}
                  result={resultById.get(line.id)}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  canRemove={Boolean(line.custom)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <AddCostDialog open={addOpen} onOpenChange={setAddOpen} onAdd={onAdd} fx={fx} />
    </div>
  );
}

function CostRow({
  line,
  result,
  onUpdate,
  onRemove,
  canRemove,
}: {
  line: CostLine;
  result?: CostLineResult;
  onUpdate: (id: string, patch: Partial<CostLine>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const isPercent = line.mode === 'percent';
  const value = isPercent ? line.percent ?? 0 : line.amount ?? 0;
  const suffix = isPercent ? '%' : line.currency === 'AED' ? 'AED' : '₹';
  const basisLabel = isPercent
    ? `of ${line.percentBase === 'revenue' ? 'sale value' : line.percentBase === 'freight' ? 'freight' : 'purchase'}`
    : line.basis === 'box'
      ? 'per box'
      : 'per shipment';

  return (
    <li className={cn('px-3 py-3 transition-colors sm:px-4', !line.enabled && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <Switch
          checked={line.enabled}
          onCheckedChange={(checked) => onUpdate(line.id, { enabled: checked })}
          label={`${line.enabled ? 'Disable' : 'Enable'} ${line.name}`}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-[13.5px] font-bold leading-snug">{line.name}</p>
            {line.custom && (
              <Badge variant="soft" className="px-1.5 py-0 text-[9px]">
                Custom
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            {line.enabled && result ? (
              <>
                {formatINR(result.amountInr, 0)} · {formatAED(result.amountAed, 0)} ·{' '}
              </>
            ) : null}
            {basisLabel}
          </p>
        </div>

        {line.enabled && (
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <div className="flex items-center rounded-lg border border-input bg-background focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
              {!isPercent && line.currency === 'AED' && (
                <span className="pl-2 text-[11px] font-bold text-muted-foreground">AED</span>
              )}
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={value}
                onChange={(e) =>
                  onUpdate(line.id, isPercent ? { percent: Number(e.target.value) } : { amount: Number(e.target.value) })
                }
                aria-label={`${line.name} ${isPercent ? 'percentage' : 'amount'}`}
                className="h-9 w-[74px] border-0 bg-transparent px-2 text-right text-[13.5px] font-semibold shadow-none focus-visible:ring-0"
              />
              <span className="pr-2 text-[11px] font-bold text-muted-foreground">{suffix}</span>
            </div>
            {canRemove && (
              <button
                type="button"
                onClick={() => onRemove(line.id)}
                aria-label={`Remove ${line.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      {line.enabled && line.note && (
        <p className="mt-1.5 pl-[56px] text-[11px] leading-snug text-muted-foreground/80">{line.note}</p>
      )}
    </li>
  );
}

function AddCostDialog({
  open,
  onOpenChange,
  onAdd,
  fx,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (line: CostLine) => void;
  fx: number;
}) {
  const [name, setName] = React.useState('');
  const [group, setGroup] = React.useState<EditableGroup>('ORIGIN');
  const [basis, setBasis] = React.useState<'shipment' | 'box'>('shipment');
  const [currency, setCurrency] = React.useState<'INR' | 'AED'>('INR');
  const [amount, setAmount] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName('');
      setAmount('');
      setError(null);
    }
  }, [open]);

  const submit = () => {
    const value = Number(amount);
    if (!name.trim()) {
      setError('Give the cost a name, e.g. “Phytosanitary certificate”.');
      return;
    }
    if (!Number.isFinite(value) || value < 0) {
      setError('Enter a valid amount.');
      return;
    }
    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: 'OTHER',
      group,
      mode: 'amount',
      basis,
      currency,
      amount: value,
      enabled: true,
      custom: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a cost</DialogTitle>
          <DialogDescription>
            Anything specific to your shipment — certificate, fumigation, cold-store, extra transport.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold">Cost name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Phytosanitary certificate"
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold">Cost group</span>
              <Select value={group} onValueChange={(v) => setGroup(v as EditableGroup)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GROUP_LABELS) as CostGroup[])
                    .filter((g): g is EditableGroup => g !== 'PURCHASE')
                    .map((g) => (
                      <SelectItem key={g} value={g}>
                        {GROUP_LABELS[g]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold">Charged</span>
              <Select value={basis} onValueChange={(v) => setBasis(v as 'shipment' | 'box')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipment">Per shipment</SelectItem>
                  <SelectItem value="box">Per box</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold">Currency</span>
              <Select value={currency} onValueChange={(v) => setCurrency(v as 'INR' | 'AED')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="AED">AED (Dubai)</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-bold">Amount</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          {currency === 'AED' && (
            <p className="rounded-xl bg-muted px-3 py-2 text-[11.5px] text-muted-foreground">
              ≈ {formatINR(Number(amount || 0) / (fx || 0.0417), 0)} at today's FX rate.
            </p>
          )}
          {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Add cost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
