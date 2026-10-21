'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, PackagePlus, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductAvatar } from '@/components/common/ProductAvatar';
import { FormField } from '@/components/layout/AuthLayout';
import { productsService } from '@/services/products.service';
import { apiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1),
});

const varietySchema = z.object({
  productId: z.coerce.number().min(1, 'Select a product'),
  variety: z.string().min(1, 'Variety is required'),
  grade: z.string().optional(),
  defaultPackagingUnit: z.string().min(1),
});

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const productsQ = useQuery({ queryKey: ['products'], queryFn: productsService.listProducts });
  const varietiesQ = useQuery({ queryKey: ['varieties'], queryFn: productsService.listVarieties });
  const products = productsQ.data || [];
  const varieties = varietiesQ.data || [];

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', category: 'FRUIT' },
  });
  const varietyForm = useForm<z.infer<typeof varietySchema>>({
    resolver: zodResolver(varietySchema),
    defaultValues: { productId: 0, variety: '', grade: '', defaultPackagingUnit: 'per box' },
  });

  const addProduct = async (data: z.infer<typeof productSchema>) => {
    try {
      await productsService.createProduct(data);
      toast({ title: 'Product added', description: data.name, variant: 'success' });
      productForm.reset({ name: '', description: '', category: 'FRUIT' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (e: any) {
      toast({ title: 'Could not add product', description: apiError(e), variant: 'destructive' });
    }
  };

  const addVariety = async (data: z.infer<typeof varietySchema>) => {
    try {
      await productsService.createVariety(data);
      toast({ title: 'Variety added', description: data.variety, variant: 'success' });
      varietyForm.reset({ productId: 0, variety: '', grade: '', defaultPackagingUnit: 'per box' });
      queryClient.invalidateQueries({ queryKey: ['varieties'] });
    } catch (e: any) {
      toast({ title: 'Could not add variety', description: apiError(e), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Products & Varieties"
        description="The produce catalogue behind Dubai rates and the export calculator."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Add product */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <PackagePlus className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">Add product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={productForm.handleSubmit(addProduct)} className="space-y-4" noValidate>
              <FormField label="Product name" error={productForm.formState.errors.name?.message}>
                <Input placeholder="e.g. Pomegranate" {...productForm.register('name')} />
              </FormField>
              <FormField label="Description (optional)">
                <Input placeholder="Short catalogue note" {...productForm.register('description')} />
              </FormField>
              <FormField label="Category">
                <Controller
                  control={productForm.control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FRUIT">Fruit</SelectItem>
                        <SelectItem value="VEGETABLE">Vegetable</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={productForm.formState.isSubmitting}>
                {productForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                Add product
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add variety */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <Sprout className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">Add variety</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={varietyForm.handleSubmit(addVariety)} className="space-y-4" noValidate>
              <FormField label="Product" error={varietyForm.formState.errors.productId?.message}>
                <Controller
                  control={varietyForm.control}
                  name="productId"
                  render={({ field }) => (
                    <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger><SelectValue placeholder={productsQ.isLoading ? 'Loading…' : 'Select product'} /></SelectTrigger>
                      <SelectContent>
                        {products.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Variety" error={varietyForm.formState.errors.variety?.message}>
                  <Input placeholder="e.g. Wonderful" {...varietyForm.register('variety')} />
                </FormField>
                <FormField label="Grade (optional)">
                  <Input placeholder="e.g. Grade A" {...varietyForm.register('grade')} />
                </FormField>
              </div>
              <FormField label="Default packaging unit">
                <Controller
                  control={varietyForm.control}
                  name="defaultPackagingUnit"
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
              <Button type="submit" className="w-full" disabled={varietyForm.formState.isSubmitting}>
                {varietyForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
                Add variety
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Products <Badge variant="soft">{products.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {productsQ.isLoading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : products.length === 0 ? (
              <EmptyState icon={Package} title="No products yet" description="Add your first product above — e.g. Pomegranate or Green Chilli." className="py-8" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="flex items-center gap-2.5">
                          <ProductAvatar name={p.name} className="h-9 w-9 rounded-lg" />
                          <span className="font-bold">{p.name}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.category === 'FRUIT' ? 'Fruit' : p.category === 'VEGETABLE' ? 'Vegetable' : p.category || '—'}</TableCell>
                      <TableCell><Badge variant="success">{p.status || 'Active'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Varieties <Badge variant="soft">{varieties.length}</Badge></CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {varietiesQ.isLoading ? (
              <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : varieties.length === 0 ? (
              <EmptyState icon={Sprout} title="No varieties yet" description="Varieties connect products to Dubai rates — add one above." className="py-8" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>Variety</TableHead><TableHead>Grade</TableHead><TableHead>Unit</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {varieties.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-semibold">{v.productName}</TableCell>
                      <TableCell>{v.variety}</TableCell>
                      <TableCell className="text-muted-foreground">{v.grade || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{v.defaultPackagingUnit || 'per box'}</Badge></TableCell>
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
