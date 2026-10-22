'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowDownWideNarrow,
  CircleAlert,
  History,
  LayoutGrid,
  MapPin,
  PackageSearch,
  RefreshCcw,
  Rows3,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { FreshnessTag, ProductAvatar } from '@/components/common/ProductAvatar';
import { PlanLock } from '@/components/common/PlanLock';
import { ratesService } from '@/services/rates.service';
import { formatAED, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type SortKey = 'newest' | 'price-desc' | 'price-asc' | 'name';
type ViewMode = 'cards' | 'table';

function isDubaiRate(r: any) {
  return (r.country || '').toLowerCase().includes('uae') || (r.city || '').toLowerCase() === 'Dubai';
}

export default function Rates() {
  const location = useLocation();
  const isHistory = location.pathname.includes('/history');
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: rates = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: ratesService.listPublished,
  });

  const [search, setSearch] = React.useState(searchParams.get('q') || '');
  const [product, setProduct] = React.useState('all');
  const [sort, setSort] = React.useState<SortKey>(isHistory ? 'newest' : 'newest');
  const [view, setView] = React.useState<ViewMode>('cards');

  React.useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== search) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const dubaiRates = React.useMemo(() => {
    const filtered = rates.filter(isDubaiRate);
    return filtered.length > 0 ? filtered : rates;
  }, [rates]);

  const productNames = React.useMemo(
    () => Array.from(new Set(dubaiRates.map((r: any) => r.productName).filter(Boolean))).sort() as string[],
    [dubaiRates]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = dubaiRates.filter((r: any) => {
      const matchesSearch =
        !q ||
        (r.productName || '').toLowerCase().includes(q) ||
        (r.variety || '').toLowerCase().includes(q) ||
        (r.grade || '').toLowerCase().includes(q);
      const matchesProduct = product === 'all' || r.productName === product;
      return matchesSearch && matchesProduct;
    });
    const by: Record<SortKey, (a: any, b: any) => number> = {
      newest: (a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime(),
      'price-desc': (a, b) => Number(b.priceAmount || 0) - Number(a.priceAmount || 0),
      'price-asc': (a, b) => Number(a.priceAmount || 0) - Number(b.priceAmount || 0),
      name: (a, b) => String(a.productName || '').localeCompare(String(b.productName || '')),
    };
    return [...result].sort(by[sort]);
  }, [dubaiRates, search, product, sort]);

  const clearFilters = () => {
    setSearch('');
    setProduct('all');
    setSearchParams({});
  };

  const hasFilters = search.trim() !== '' || product !== 'all';

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={isHistory ? 'Price history' : 'Live market'}
        title={isHistory ? 'Dubai Price History' : 'Dubai Live Rates'}
        description={
          isHistory
            ? 'Every published Dubai rate with its effective time — your paper trail for price movements in AED.'
            : 'Dubai, UAE wholesale market prices in AED, published by our market team. Never Indian domestic rates.'
        }
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-extrabold text-brand-800 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200 sm:inline-flex">
              <MapPin className="h-3.5 w-3.5" /> Dubai · AED
            </span>
            <Button asChild variant="outline">
              <Link to={isHistory ? '/rates' : '/rates/history'}>
                {isHistory ? <TrendingUp className="h-4 w-4" /> : <History className="h-4 w-4" />}
                {isHistory ? 'Live rates' : 'Price history'}
              </Link>
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, variety, grade…"
              aria-label="Search rates"
              className="pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[172px]" aria-label="Sort rates">
                <ArrowDownWideNarrow className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-desc">Price: high → low</SelectItem>
                <SelectItem value="price-asc">Price: low → high</SelectItem>
                <SelectItem value="name">Product A–Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden items-center rounded-xl border border-border bg-card p-1 shadow-sm md:flex" role="group" aria-label="View mode">
              <ViewToggleButton active={view === 'cards'} onClick={() => setView('cards')} label="Card view" icon={LayoutGrid} />
              <ViewToggleButton active={view === 'table'} onClick={() => setView('table')} label="Table view" icon={Rows3} />
            </div>
          </div>
        </div>

        {/* Product chips */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by product">
          <FilterChip active={product === 'all'} onClick={() => setProduct('all')} label="All products" />
          {productNames.map((name) => (
            <FilterChip key={name} active={product === name} onClick={() => setProduct(name)} label={name} />
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[168px] rounded-2xl" />
          ))}
        </div>
      ) : isError && (error as any)?.response?.status === 403 ? (
        <PlanLock
          title="Live Dubai rates need an active plan"
          description="Your account doesn't include market-rate access right now. Subscribe or renew to see today's AED wholesale prices."
          benefits={['Daily Dubai wholesale prices in AED', 'Price history and trend charts', 'All grades and pack sizes']}
        />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="Could not load Dubai rates"
            description="The FreshmCalc server didn't respond. This can happen if the backend is starting up — please retry."
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
            icon={PackageSearch}
            title={hasFilters ? 'No rates match your filters' : 'No Dubai rates published yet'}
            description={
              hasFilters
                ? 'Try a different product name or clear the filters to see everything.'
                : 'New AED wholesale rates will appear here as soon as our market team publishes them.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : isHistory ? (
        <HistoryView rates={filtered} product={product} productNames={productNames} onSelectProduct={setProduct} />
      ) : (
        <>
          {/* Cards: always on mobile, toggleable on md+ */}
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', view === 'table' && 'md:hidden')}>
            {filtered.map((r: any) => (
              <RateCard key={r.id} rate={r} />
            ))}
          </div>

          {/* Table: md+ when selected */}
          {view === 'table' && (
            <Card className="hidden overflow-hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variety / Grade</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead className="text-right">Price (AED)</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Packaging</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Freshness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="flex items-center gap-3">
                          <ProductAvatar name={r.productName} className="h-9 w-9 rounded-lg" />
                          <span className="font-bold">{r.productName}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{[r.variety, r.grade].filter(Boolean).join(' / ') || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{r.originCountry || 'India'}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatAED(Number(r.priceAmount))}</TableCell>
                      <TableCell>{r.pricingUnit}</TableCell>
                      <TableCell className="text-muted-foreground">{r.packagingDetails || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status || 'Published'}</Badge>
                      </TableCell>
                      <TableCell>
                        <FreshnessTag value={r.lastUpdated} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {!isLoading && !isError && dubaiRates.length > 0 && (
        <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> of {dubaiRates.length} Dubai rates
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="ml-2 font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
                Clear filters
              </button>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Publisher-published · Al Aweer Wholesale Market, Dubai
          </span>
        </p>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-[38px] shrink-0 rounded-full border px-4 text-[13px] font-bold transition-all active:scale-95',
        active
          ? 'border-brand-700 bg-gradient-to-b from-brand-600 to-brand-700 text-white shadow-soft'
          : 'border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-brand-800 dark:hover:border-brand-700 dark:hover:text-brand-200'
      )}
    >
      {label}
    </button>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-10 items-center justify-center rounded-lg transition-all',
        active ? 'bg-brand-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-accent'
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

function RateCard({ rate: r }: { rate: any }) {
  return (
    <article className="group rounded-3xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700">
      <div className="flex items-start gap-3">
        <ProductAvatar name={r.productName} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold">{r.productName}</h3>
          <p className="truncate text-[13px] text-muted-foreground">{[r.variety, r.grade].filter(Boolean).join(' · ') || 'Standard grade'}</p>
        </div>
        <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status || 'Published'}</Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2 rounded-2xl bg-brand-50 px-4 py-3 dark:bg-brand-950/70">
        <div>
          <p className="font-mono text-[22px] font-semibold leading-none text-brand-900 dark:text-brand-100">
            {formatAED(Number(r.priceAmount))}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand-700 dark:text-brand-300">{r.pricingUnit}</p>
        </div>
        <p className="text-right text-[11px] leading-snug text-muted-foreground">
          {r.packagingDetails || 'Standard pack'}
          <br />
          Origin: {r.originCountry || 'India'}
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <FreshnessTag value={r.lastUpdated} />
        <span className="truncate text-[11px] text-muted-foreground">{r.marketName || 'Dubai Wholesale'}</span>
      </div>
    </article>
  );
}

/** History variant: trend line for the selected product + chronological ledger. */
function HistoryView({
  rates,
  product,
  productNames,
  onSelectProduct,
}: {
  rates: any[];
  product: string;
  productNames: string[];
  onSelectProduct: (p: string) => void;
}) {
  const selected = product === 'all' ? productNames[0] : product;
  const series = React.useMemo(
    () =>
      rates
        .filter((r: any) => r.productName === selected && r.lastUpdated)
        .sort((a: any, b: any) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
        .map((r: any) => ({
          time: new Date(r.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          price: Number(r.priceAmount),
        })),
    [rates, selected]
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            Price trend — {selected || 'select a product'}
            {series.length < 2 && <Badge variant="warn">Collecting history</Badge>}
          </CardTitle>
          <CardDescription>
            {series.length < 2
              ? 'Only the latest published point is available right now. The trend line grows automatically as new Dubai rates are published.'
              : 'Published Dubai prices over time (AED).'}{' '}
            {product === 'all' && productNames.length > 0 && 'Pick a product chip above to change the trend.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <EmptyState icon={History} title="No history points yet" description="Published rates with timestamps will build this chart over time." className="py-8" />
          ) : (
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }} dy={6} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.65 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(v: number) => [`AED ${v.toFixed(2)}`, 'Published price']}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 13 }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#277f52" strokeWidth={2.5} dot={{ r: 4, fill: '#277f52' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Published rate ledger</CardTitle>
          <CardDescription>Newest first · Dubai, UAE · AED</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <ul className="divide-y divide-border/60">
            {rates.map((r: any) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-950/50 sm:px-5">
                <ProductAvatar name={r.productName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.productName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[r.variety, r.grade].filter(Boolean).join(' · ') || '—'} · {formatDateTime(r.effectiveDateTime || r.lastUpdated)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{formatAED(Number(r.priceAmount))}</p>
                  <p className="text-[11px] text-muted-foreground">{r.pricingUnit}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
