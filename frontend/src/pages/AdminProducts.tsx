'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus } from 'lucide-react';
import { productsService } from '@/services/products.service';

export default function AdminProducts() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [varieties, setVarieties] = React.useState<any[]>([]);

  React.useEffect(() => {
    productsService.listProducts().then((d) => setProducts(d || []));
    productsService.listVarieties().then((d) => setVarieties(d || []));
  }, []);

  const productSchema = z.object({ name: z.string().min(1), description: z.string().optional(), category: z.string().optional() });
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<z.infer<typeof productSchema>>({ resolver: zodResolver(productSchema) });

  const addProduct = async (data: z.infer<typeof productSchema>) => {
    try {
      await productsService.createProduct(data);
      reset({ name: '', description: '', category: '' });
      productsService.listProducts().then((d) => setProducts(d || []));
    } catch (e: any) {
      alert('Failed: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products & Varieties</h1>
          <p className="text-muted-foreground">Manage products, varieties, grades and default packaging units.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><ShoppingCart className="mr-2 h-4 w-4" /><span>Add product</span></Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Add product</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(addProduct)} className="space-y-4">
              <Field label="Product name (e.g. Pomegranate)" {...register('name')} />
              <Field label="Description" {...register('description')} />
              <Field label="Category (FRUIT / VEGETABLE)" {...register('category')} defaultValue="FRUIT" />
              <Button type="submit" className="w-full bg-primary text-primary-foreground">Add product</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-sm"><Badge variant="success">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {products.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No products yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Varieties</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Default unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {varieties.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{v.productName}</TableCell>
                    <TableCell className="text-sm">{v.variety}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.grade}</TableCell>
                    <TableCell className="text-sm">{v.defaultPackagingUnit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {varieties.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No varieties yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', ...props }: { label: string; type?: string; [key: string]: any }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} {...props} />
    </div>
  );
}
