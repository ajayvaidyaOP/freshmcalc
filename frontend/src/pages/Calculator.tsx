'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { calculationsService } from '@/services/calculations.service';
import { CreditCard, Save } from 'lucide-react';

const schema = z.object({
  product: z.string().min(1),
  variety: z.string().optional(),
  grade: z.string().optional(),
  packingCentre: z.string().optional(),
  originCity: z.string().min(1),
  originPort: z.string().min(1),
  destinationCountry: z.string().min(1),
  destinationCity: z.string().min(1),
  destinationPort: z.string().min(1),
  containerType: z.string().min(1),
  numberOfBoxes: z.coerce.number().positive(),
  netWeightKg: z.coerce.number().positive(),
  grossWeightKg: z.coerce.number().positive(),
  productCostPerUnit: z.coerce.number().nonnegative(),
  productCostUnit: z.string().min(1),
  expectedDubaiSellingPricePerUnit: z.coerce.number().nonnegative(),
  expectedDubaiSellingPriceUnit: z.string().min(1),
  conversionRateInrToAed: z.coerce.number().positive(),
  conversionSource: z.string().optional(),
  assumptions: z.string().optional(),
});

const CONTAINER_TYPES = ['20FT', '40FT', '40HC', 'REEFER'];

export default function Calculator() {
  const {
    register, handleSubmit, watch, formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: {
    product: 'Pomegranate', variety: 'Wonderful', grade: 'Grade A', packingCentre: '',
    originCity: 'Mumbai', originPort: 'JNPA / Nhava Sheva', destinationCountry: 'UAE',
    destinationCity: 'Dubai', destinationPort: 'Jebel Ali Port, Dubai', containerType: '20FT',
    numberOfBoxes: 10, netWeightKg: 100, grossWeightKg: 110, productCostPerUnit: 50,
    productCostUnit: 'per box', expectedDubaiSellingPricePerUnit: 70,
    expectedDubaiSellingPriceUnit: 'per box', conversionRateInrToAed: 0.05,
    conversionSource: 'Manual', assumptions: '',
  }});

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await calculationsService.create(data);
      alert('Calculation saved successfully.');
    } catch (e: any) {
      alert('Save failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const productCost = watch('productCostPerUnit', 0) * watch('numberOfBoxes', 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">India-to-Dubai Export Calculator</h1>
          <p className="text-muted-foreground">Compute Dubai landed cost, revenue and profit. All amounts processed by the Java backend using BigDecimal.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CreditCard size={14} /> Currency: INR &rarr; AED
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle><CreditCard className="mr-2 h-4 w-4" /> Shipment details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>Product</Label><Input {...register('product')} /></div>
            <div className="space-y-1"><Label>Variety</Label><Input {...register('variety')} /></div>
            <div className="space-y-1"><Label>Grade</Label><Input {...register('grade')} /></div>
            <div className="space-y-1"><Label>Packing centre</Label><Input {...register('packingCentre')} /></div>
            <div className="space-y-1"><Label>Origin city</Label><Input {...register('originCity')} /></div>
            <div className="space-y-1"><Label>Origin port</Label><Input {...register('originPort')} /></div>
            <div className="space-y-1"><Label>Destination country</Label><Input {...register('destinationCountry')} /></div>
            <div className="space-y-1"><Label>Destination city</Label><Input {...register('destinationCity')} /></div>
            <div className="space-y-1"><Label>Destination port</Label><Input {...register('destinationPort')} /></div>
            <div className="space-y-1"><Label>Container type</Label>
              <Select {...register('containerType')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select container" /></SelectTrigger>
                <SelectContent>
                  {CONTAINER_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Number of boxes</Label><Input type="number" {...register('numberOfBoxes')} /></div>
            <div className="space-y-1"><Label>Net weight (kg)</Label><Input type="number" {...register('netWeightKg')} /></div>
            <div className="space-y-1"><Label>Gross weight (kg)</Label><Input type="number" {...register('grossWeightKg')} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & currency</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>Product cost per unit</Label><Input type="number" {...register('productCostPerUnit')} /></div>
            <div className="space-y-1"><Label>Cost unit</Label>
              <Select {...register('productCostUnit')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="per box" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="per box">Per box</SelectItem>
                  <SelectItem value="per kg">Per kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Expected Dubai sell price/unit</Label><Input type="number" {...register('expectedDubaiSellingPricePerUnit')} /></div>
            <div className="space-y-1"><Label>Sell price unit</Label>
              <Select {...register('expectedDubaiSellingPriceUnit')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="per box" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="per box">Per box</SelectItem>
                  <SelectItem value="per kg">Per kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>INR &rarr; AED rate</Label><Input type="number" step="0.000001" {...register('conversionRateInrToAed')} /></div>
            <div className="space-y-1"><Label>Conversion source</Label><Input {...register('conversionSource')} /></div>
            <div className="space-y-1"><Label>Assumptions</Label><Input {...register('assumptions')} /></div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Est. product purchase cost (INR)</span>
            <span className="font-mono text-lg">{productCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-muted-foreground">Note: detailed per-item expense breakdown and AED totals are returned from the backend after save. This preview shows the supplier purchase subtotal only.</p>
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground">
          <Save className="mr-2" /> Save calculation
        </Button>
      </form>
    </div>
  );
}
