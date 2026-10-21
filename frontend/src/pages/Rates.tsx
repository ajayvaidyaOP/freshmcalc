'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Shirt, Search, Filter, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { ratesService } from '@/services/rates.service';
import { productsService } from '@/services/products.service';

export default function Rates() {
  const { data: rates = [], isLoading } = useQuery({ queryKey: ['rates'], queryFn: ratesService.listPublished });
  const { data: products = [], isLoading: ploading } = useQuery({ queryKey: ['products'], queryFn: productsService.listProducts });

  const [search, setSearch] = React.useState('');
  const [productFilter, setProductFilter] = React.useState('');

  const dubaiRates = rates.filter((r: any) => r.country === 'UAE' && r.city === 'Dubai');
  const filtered = dubaiRates.filter((r: any) => {
    const matchSearch = !search || (r.productName || '').toLowerCase().includes(search.toLowerCase()) || (r.variety || '').toLowerCase().includes(search.toLowerCase());
    const matchProduct = !productFilter || r.productName === productFilter;
    return matchSearch && matchProduct;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Latest Dubai Product Rates</h1>
          <p className="text-muted-foreground">Dubai, UAE wholesale market — AED. Never Indian domestic prices.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe size={14} /> Dubai, UAE &bull; AED
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search product, variety..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={productFilter} onValueChange={(v: string) => setProductFilter(v)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="" value="">All products</SelectItem>
            {products.map((p: any) => (
              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild className="w-full"><Link to="/rates/history">Price history</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dubai market rates</CardTitle>
          <CardDescription>Publisher-published rates. Currency: AED. Units per product configuration.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || ploading ? (
            <div className="p-6 text-center">Loading Dubai rates...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No Dubai rates match your filters.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Product</th>
                    <th className="text-left p-3 text-muted-foreground">Variety / Grade</th>
                    <th className="text-left p-3 text-muted-foreground">Origin</th>
                    <th className="text-right p-3 text-muted-foreground">Price (AED)</th>
                    <th className="text-left p-3 text-muted-foreground">Unit</th>
                    <th className="text-left p-3 text-muted-foreground">Packaging</th>
                    <th className="text-left p-3 text-muted-foreground">Market</th>
                    <th className="text-left p-3 text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-muted-foreground">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="p-3 font-medium">{r.productName}</td>
                      <td className="p-3">{r.variety} / {r.grade}</td>
                      <td className="p-3 text-xs text-muted-foreground">{r.originCountry || '—'}</td>
                      <td className="p-3 text-right font-mono">{r.priceAmount}</td>
                      <td className="p-3">{r.pricingUnit}</td>
                      <td className="p-3 text-xs text-muted-foreground">{r.packagingDetails || '—'}</td>
                      <td className="p-3 text-xs text-muted-foreground">{r.marketName}</td>
                      <td className="p-3"><Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {dubaiRates.length} Dubai rates shown
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live (admin-published)
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
