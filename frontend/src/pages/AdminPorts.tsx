'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus } from 'lucide-react';
import { portsService } from '@/services/ports.service';
import { routesService } from '@/services/routes.service';

export default function AdminPorts() {
  const [ports, setPorts] = React.useState<any[]>([]);
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [quotes, setQuotes] = React.useState<any[]>([]);

  React.useEffect(() => {
    portsService.listPorts().then((d) => setPorts(d || []));
    routesService.listRoutes().then((d) => setRoutes(d || []));
    routesService.listFreightQuotes().then((d) => setQuotes(d || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ports & Routes</h1>
          <p className="text-muted-foreground">Indian origin ports, Dubai/international destinations, routes and freight quotes.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><Globe className="mr-2 h-4 w-4" /><span>Add port</span></Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Ports</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Port name</TableHead>
                  <TableHead>UN/LOCODE</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ports.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.unlocode}</TableCell>
                    <TableCell className="text-sm">{p.portType}</TableCell>
                    <TableCell className="text-sm">{p.countryName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {ports.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No ports yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shipping routes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin → Destination</TableHead>
                  <TableHead>Transit (days)</TableHead>
                  <TableHead>Operational</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{r.originPortName} → {r.destinationPortName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.transitTimeDays ?? '—'}</TableCell>
                    <TableCell className="text-sm"><Badge variant={r.operational ? 'success' : 'warn'}>{r.operational ? 'Operational' : 'Not operational'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {routes.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No routes yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Freight quotes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{q.containerType}</TableCell>
                    <TableCell className="text-sm font-mono text-right">{q.amount}</TableCell>
                    <TableCell className="text-sm">{q.currency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{q.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {quotes.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No freight quotes yet.</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Add port</CardTitle></CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-4 gap-4">
            <Field label="Port name" {...{ register: () => ({}) }} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, ...props }: { label: string; [key: string]: any }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}
