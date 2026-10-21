'use client';

import * as React from 'react';
import { ShieldAlert, Users, DollarSign, Shirt, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage Dubai market rates, users, subscriptions, ports and routes.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Registered customers" value="—" icon={Users} />
        <StatCard title="Active subscriptions" value="—" icon={DollarSign} variant="success" />
        <StatCard title="Dubai rates published today" value="—" icon={Shirt} />
        <StatCard title="Stale rates" value="—" icon={AlertCircle} variant="destructive" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <AdminCard title="Dubai Market Rates" desc="Add, edit, publish and manage Dubai market rates (AED)." icon={Shirt} href="/admin/rates" />
        <AdminCard title="Products & Varieties" desc="Manage products, varieties, grades and packaging units." icon={ShoppingCart} href="/admin/products" />
        <AdminCard title="Ports & Routes" desc="Manage Indian origin and Dubai/international ports, routes and freight quotes." icon={Clock} href="/admin/ports" />
        <AdminCard title="Users & Subscriptions" desc="Manage customer accounts, plans and entitlements." icon={Users} href="/admin/users" />
      </div>

      <div className="rounded-lg border border-input bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>All market rates are Dubai, UAE (AED) — publisher-published. Indian domestic prices are never shown as Dubai rates.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, variant }: { title: string; value: string | number; icon: React.ElementType; variant?: 'default' | 'success' | 'destructive' }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${variant === 'success' ? 'text-emerald-600' : variant === 'destructive' ? 'text-destructive' : ''}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AdminCard({ title, desc, icon: Icon, href }: { title: string; desc: string; icon: React.ElementType; href: string }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = href}>
      <CardHeader className="flex flex-row items-center space-between pb-1">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="hidden md:block text-sm">{desc}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-auto">Open</Button>
      </CardFooter>
    </Card>
  );
}
