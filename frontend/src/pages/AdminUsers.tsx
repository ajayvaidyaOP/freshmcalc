'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldAlert } from 'lucide-react';

export default function AdminUsers() {
  const [users] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users & Subscriptions</h1>
          <p className="text-muted-foreground">Manage customer accounts, plans and entitlements.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground"><Users className="mr-2 h-4 w-4" /><span>Invite user</span></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Role-based access and subscription status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell className="p-4 text-center text-muted-foreground">
                    No user records yet. Users appear here after registration.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="text-sm">{u.role}</TableCell>
                    <TableCell className="text-sm"><Badge variant="success">{u.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.subscriptionStatus || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
