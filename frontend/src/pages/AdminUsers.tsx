'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, MailPlus, RefreshCcw, Search, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { usersService } from '@/services/users.service';
import { formatDate } from '@/lib/format';

export default function AdminUsers() {
  const usersQ = useQuery({ queryKey: ['admin-users'], queryFn: usersService.listUsers });
  const [search, setSearch] = React.useState('');
  const users = React.useMemo(() => usersQ.data || [], [usersQ.data]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user: any) =>
      [user.email, user.firstName, user.lastName, user.company, user.activePlanName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)));
  }, [users, search]);
  const activePlans = users.filter((user: any) => Boolean(user.activePlanName)).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Users & Subscriptions"
        description="Live server directory of registered accounts, roles and current fixed-term plan access."
        actions={
          <Button asChild>
            <Link to="/register"><MailPlus className="h-4 w-4" /> Invite via signup link</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard icon={Users} label="Registered" value={users.length} />
        <SummaryCard icon={CreditCard} label="Active plans" value={activePlans} />
        <SummaryCard icon={ShieldCheck} label="Admins" value={users.filter((user: any) => user.role === 'ADMIN').length} />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, company or plan…"
          aria-label="Search users"
          className="pl-10"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Registered users</CardTitle>
          <CardDescription>Read-only account directory. Plan changes still require verified payment or a controlled support process.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {usersQ.isLoading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : usersQ.isError ? (
            <EmptyState
              icon={Users}
              title="Could not load users"
              description="The admin directory did not respond. Please retry."
              action={<Button variant="outline" onClick={() => usersQ.refetch()}><RefreshCcw className="h-4 w-4" /> Retry</Button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? 'No users match your search' : 'No registered users yet'}
              description={search ? 'Try a different email, name or company.' : 'Share the registration link to onboard your first trader.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role / status</TableHead>
                    <TableHead>Active plan</TableHead>
                    <TableHead>Access ends</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="block font-semibold">{[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed user'}</span>
                        <span className="block text-xs text-muted-foreground">{user.email}</span>
                      </TableCell>
                      <TableCell>{user.company || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={user.role === 'ADMIN' ? 'soft' : 'outline'}>{user.role}</Badge>
                          <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warn'}>{user.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{user.activePlanName ? <Badge variant="success">{user.activePlanName}</Badge> : 'No active plan'}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.createdAt ? formatDate(user.createdAt) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card className="p-3 sm:p-5">
      <Icon className="mb-2 h-5 w-5 text-brand-600 dark:text-brand-400" />
      <p className="font-display text-xl font-extrabold sm:text-2xl">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground sm:text-xs">{label}</p>
    </Card>
  );
}
