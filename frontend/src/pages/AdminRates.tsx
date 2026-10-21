'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shirt, Plus, Save } from 'lucide-react';
import { ratesService } from '@/services/rates.service';
import { productsService } from '@/services/products.service';

const schema = z.object({
  productVarietyId: z.coerce.number(),
  marketName: z.string().min(1, 'Market name required').default('Dubai Wholesale Market'),
  country: z.string().min(1).default('UAE'),
  city: z.string().min(1).default('Dubai'),
  priceAmount: z.coerce.number().nonnegative(),
  currency: z.string().min(1).default('AED'),
  pricingUnit: z.string().min(1),
  packagingDetails: z.string().optional(),
  originCountry: z.string().optional(),
  effectiveDateTime: z.string().optional(),
  dataSource: z.string().min(1).default('ADMIN'),
  sourceReference: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminRates() {
  const [varieties, setVarieties] = React.useState<any[]>([]);
  const [rates, setRates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    productsService.listVarieties().then((d: any) => setVarieties(d || []));
    ratesService.listPublished().then((d: any) => setRates(d || []));
  }, []);

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: {
    productVarietyId: 0, marketName: 'Dubai Wholesale Market', country: 'UAE', city: 'Dubai',
    priceAmount: 0, currency: 'AED', pricingUnit: 'per box', packagingDetails: '', originCountry: 'India',
    effectiveDateTime: new Date().toISOString(), dataSource: 'ADMIN', sourceReference: '',
  }});

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await ratesService.createRate(data);
      reset({
        productVarietyId: 0, marketName: 'Dubai Wholesale Market', country: 'UAE', city: 'Dubai',
        priceAmount: 0, currency: 'AED', pricingUnit: 'per box', packagingDetails: '', originCountry: 'India',
        effectiveDateTime: new Date().toISOString(), dataSource: 'ADMIN', sourceReference: '',
      });
      ratesService.listPublished().then((d: any) => setRates(d || []));
    } catch (e: any) {
      alert('Failed: ' + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Dubai Market Rates</h1>
          <p className="text-muted-foreground">Add, edit and publish Dubai, UAE (AED) rates. Never Indian domestic prices.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><Shirt className="mr-2 h-4 w-4" /><span>Publish rate</span></Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Add / publish a Dubai rate</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Product variety</Label>
                  <Select {...register('productVarietyId') as any}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select variety" /></SelectTrigger>
                    <SelectContent>
                      {varieties.map((v: any) => (
                        <SelectItem key={v.id} value={String(v.id)}>{`${v.productName} — ${v.variety} / ${v.grade} (${v.defaultPackagingUnit})`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Price amount</Label><Input type="number" {...register('priceAmount')} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Currency</Label>
                  <Select {...register('currency') as any}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="AED" /></SelectTrigger>
                    <SelectContent><SelectItem value="AED">AED</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Pricing unit</Label>
                  <Select {...register('pricingUnit') as any}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="per box" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per kg">Per kg</SelectItem>
                      <SelectItem value="per box">Per box</SelectItem>
                      <SelectItem value="per carton">Per carton</SelectItem>
                      <SelectItem value="per tonne">Per tonne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Market name</Label><Input defaultValue="Dubai Wholesale Market" {...register('marketName')} /></div>
              <div className="space-y-1"><Label>Packaging details</Label><Input placeholder="e.g. 5 kg carton" {...register('packagingDetails')} /></div>
              <div className="space-y-1"><Label>Origin country</Label><Input defaultValue="India" {...register('originCountry')} /></div>
              <div className="space-y-1"><Label>Source reference</Label><Input placeholder="e.g. admin entry ref-001" {...register('sourceReference')} /></div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                <Save className="mr-2 h-4 w-4" /> {loading ? 'Publishing...' : 'Publish Dubai rate'}
              </Button>
              <p className="text-xs text-muted-foreground">Rates are admin-entered and labeled as such — not real-time auto-fetched.</p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Published Dubai rates</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price (AED)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{r.productName}</TableCell>
                    <TableCell className="text-sm font-mono text-right">{r.priceAmount}</TableCell>
                    <TableCell className="text-sm">{r.pricingUnit}</TableCell>
                    <TableCell className="text-sm"><Badge variant={r.status === 'PUBLISHED' ? 'success' : 'warn'}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm text-right text-muted-foreground">{r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rates.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No published Dubai rates yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
