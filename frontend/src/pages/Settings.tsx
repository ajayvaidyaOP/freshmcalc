'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Building, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const userRaw = localStorage.getItem('freshmcalc_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="text-muted-foreground">Manage your profile and account preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4"><Label className="text-sm font-medium">Full name</Label><Input defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">Email</Label><Input defaultValue={user?.email || ''} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">Phone</Label><Input defaultValue={user?.phone || ''} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">Company</Label><Input defaultValue={user?.company || ''} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">Country</Label><Input defaultValue={user?.country || ''} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">City</Label><Input defaultValue={user?.city || ''} /></div>
          <div className="space-y-4"><Label className="text-sm font-medium">Role</Label><Input defaultValue={user?.role || 'CUSTOMER'} readOnly /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label className="text-sm font-medium">Change password</Label><Input type="password" placeholder="New password" /></div>
          <Button variant="outline" className="w-auto">Update password</Button>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-input bg-muted p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <LogOut className="h-4 w-4" /> <strong>Sign out</strong>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="text-sm text-destructive hover:underline">Sign out of FreshmCalc</button>
      </div>
    </div>
  );
}
