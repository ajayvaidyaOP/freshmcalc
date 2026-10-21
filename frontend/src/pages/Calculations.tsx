'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculationsService } from '@/services/calculations.service';
import { generateQuotationPdf } from '@/lib/pdf';
import { Save } from 'lucide-react';

export default function Calculations() {
  const { data: calculations = [], isLoading } = useQuery({ queryKey: ['calculations'], queryFn: calculationsService.list });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Saved Cost Sheets</h1>
          <p className="text-muted-foreground">Historical calculation snapshots — values never silently change.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><Link to="/calculator">New calculation</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4">Loading...</div>
          ) : calculations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No saved calculations yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Landed cost (AED)</TableHead>
                  <TableHead className="text-right">Gross profit (AED)</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((c: any) => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">{c.referenceNumber}</TableCell>
                    <TableCell className="text-sm">{c.product}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.originPort} → {c.destinationPort}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{c.totalLandedCostAed?.toFixed(2) ?? '—'}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{c.grossProfitAed?.toFixed(2) ?? '—'}</TableCell>
                    <TableCell className="text-right text-sm">{c.profitMarginPercent?.toFixed(2) ?? '—'}%</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); generateQuotationPdf(c); }}>
                        <Save className="mr-1 h-3 w-3" /> Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
