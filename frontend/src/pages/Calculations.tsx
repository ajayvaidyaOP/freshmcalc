'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CircleAlert, FileDown, FileText, RefreshCcw, Search, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductAvatar } from '@/components/common/ProductAvatar';
import { calculationsService } from '@/services/calculations.service';
import { generateQuotationPdf } from '@/lib/pdf';
import { isNativeApp } from '@/lib/platform';
import { formatAED, formatDate, formatNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Calculations() {
  const { data: calculations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['calculations'],
    queryFn: calculationsService.list,
  });
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return calculations;
    return calculations.filter(
      (c: any) =>
        (c.product || '').toLowerCase().includes(q) ||
        (c.referenceNumber || '').toLowerCase().includes(q) ||
        (c.originPort || '').toLowerCase().includes(q) ||
        (c.destinationPort || '').toLowerCase().includes(q)
    );
  }, [calculations, search]);

  const totals = React.useMemo(() => {
    const profit = calculations.reduce((s: number, c: any) => s + Number(c.grossProfitAed || 0), 0);
    const margins = calculations.filter((c: any) => c.profitMarginPercent != null).map((c: any) => Number(c.profitMarginPercent));
    const avgMargin = margins.length ? margins.reduce((a: number, b: number) => a + b, 0) / margins.length : null;
    return { profit, avgMargin };
  }, [calculations]);

  const exportPdf = async (c: any) => {
    try {
      await generateQuotationPdf(c);
      toast({
        title: isNativeApp() ? 'Quotation ready to share' : 'PDF quotation downloaded',
        description: c.referenceNumber || c.product,
        variant: 'success',
      });
    } catch {
      toast({ title: 'PDF export failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Your archive"
        title="Saved Cost Sheets"
        description="Permanent snapshots of every costing — FX rate, prices and assumptions frozen at save time."
        actions={
          <Button asChild>
            <Link to="/calculator">
              <Calculator className="h-4 w-4" /> New calculation
            </Link>
          </Button>
        }
      />

      {!isLoading && calculations.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="Cost sheets" value={String(calculations.length)} />
          <SummaryCard label="Total est. profit (AED)" value={formatNumber(totals.profit, 0)} />
          <SummaryCard label="Avg. margin" value={totals.avgMargin != null ? `${formatNumber(totals.avgMargin, 1)}%` : '—'} />
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product, reference, port…" aria-label="Search cost sheets" className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[210px] rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="Could not load your cost sheets"
            description="The FreshmCalc server didn't respond. Your saved sheets are safe — please retry."
            action={
              <Button onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4" /> Retry
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title={search ? 'No cost sheets match your search' : 'No cost sheets yet'}
            description={
              search
                ? 'Try a different product or reference number.'
                : 'Run your first India → Dubai costing and it will be saved here with a reference number, ready to export as a PDF quotation.'
            }
            action={
              search ? (
                <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>
              ) : (
                <Button asChild>
                  <Link to="/calculator">Create your first costing <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          {/* Cards — phones & tablets */}
          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((c: any) => (
              <CostSheetCard key={c.id} c={c} onExport={() => exportPdf(c)} />
            ))}
          </div>

          {/* Table — desktop */}
          <Card className="hidden overflow-hidden lg:block">
            <CardContent className="p-0 sm:p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-right">Landed cost (AED)</TableHead>
                    <TableHead className="text-right">Gross profit (AED)</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead className="text-right">Quotation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap font-mono text-[13px] font-semibold">{c.referenceNumber || `#${c.id}`}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2.5">
                          <ProductAvatar name={c.product} className="h-9 w-9 rounded-lg" />
                          <span>
                            <span className="block font-bold leading-tight">{c.product}</span>
                            <span className="block text-xs text-muted-foreground">{[c.variety, c.grade].filter(Boolean).join(' · ')}</span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {shortPort(c.originPort)} → {shortPort(c.destinationPort)}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatAED(c.totalLandedCostAed)}</TableCell>
                      <TableCell className={cn('text-right font-mono font-semibold', Number(c.grossProfitAed) >= 0 ? 'text-brand-700 dark:text-brand-300' : 'text-red-500')}>
                        {formatAED(c.grossProfitAed)}
                      </TableCell>
                      <TableCell className="text-right"><MarginBadge value={c.profitMarginPercent} /></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => exportPdf(c)}>
                          <FileDown className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function shortPort(p?: string) {
  if (!p) return '—';
  return p.split(',')[0].replace(' Port', '').trim();
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 truncate font-display text-xl font-extrabold sm:text-2xl">{value}</p>
    </Card>
  );
}

function MarginBadge({ value }: { value?: number | null }) {
  if (value == null || Number.isNaN(Number(value))) return <span className="text-muted-foreground">—</span>;
  const v = Number(value);
  return <Badge variant={v >= 15 ? 'success' : v >= 0 ? 'warn' : 'danger'}>{formatNumber(v, 1)}%</Badge>;
}

function CostSheetCard({ c, onExport }: { c: any; onExport: () => void }) {
  return (
    <article className="rounded-3xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <ProductAvatar name={c.product} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold">{c.product}</h3>
          <p className="truncate font-mono text-xs text-muted-foreground">{c.referenceNumber || `Sheet #${c.id}`}</p>
        </div>
        <MarginBadge value={c.profitMarginPercent} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
        <Ship className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
        {shortPort(c.originPort)} → {shortPort(c.destinationPort)}
        {c.containerType ? ` · ${c.containerType}` : ''}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-brand-50 p-3.5 dark:bg-brand-950/70">
        <div>
          <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Landed cost</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold">{formatAED(c.totalLandedCostAed)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Gross profit</dt>
          <dd className={cn('mt-0.5 font-mono text-sm font-semibold', Number(c.grossProfitAed) >= 0 ? 'text-brand-700 dark:text-brand-300' : 'text-red-500')}>
            {formatAED(c.grossProfitAed)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Saved {formatDate(c.createdAt)}</span>
        <Button size="sm" variant="outline" onClick={onExport}>
          <FileDown className="h-3.5 w-3.5" /> PDF quotation
        </Button>
      </div>
    </article>
  );
}
