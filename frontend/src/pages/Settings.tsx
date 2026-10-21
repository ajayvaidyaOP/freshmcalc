'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, Building2, Lock, LogOut, Mail, MapPin, MonitorSmartphone, Moon, Phone, Save, Sun, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/layout/AuthLayout';
import { clearAuth, getAuth } from '@/lib/api';
import { displayName, initials } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { useTheme, type ThemePreference } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = getAuth();
  const { preference, setPreference } = useTheme();

  const [profile, setProfile] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    country: user?.country || 'India',
    city: user?.city || '',
  });
  const [notifyRates, setNotifyRates] = React.useState(() => localStorage.getItem('freshmcalc_notify_rates') !== 'off');
  const [notifyBilling, setNotifyBilling] = React.useState(() => localStorage.getItem('freshmcalc_notify_billing') !== 'off');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const saveProfile = () => {
    try {
      const current = getAuth().user || {};
      localStorage.setItem('freshmcalc_user', JSON.stringify({ ...current, ...profile }));
      toast({ title: 'Profile saved', description: 'Your details are updated on this device.', variant: 'success' });
    } catch {
      toast({ title: 'Could not save', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const toggleNotify = (key: 'rates' | 'billing', value: boolean) => {
    localStorage.setItem(key === 'rates' ? 'freshmcalc_notify_rates' : 'freshmcalc_notify_billing', value ? 'on' : 'off');
    if (key === 'rates') setNotifyRates(value);
    else setNotifyBilling(value);
    toast({ title: value ? 'Notifications on' : 'Notifications off', variant: 'success' });
  };

  const logout = () => {
    clearAuth();
    toast({ title: 'Signed out', description: 'See you soon. Fresh rates will be waiting.', variant: 'success' });
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <PageHeader eyebrow="Account" title="Account Settings" description="Your profile, appearance and notification preferences." />

      {/* Identity card */}
      <div className="surface-forest flex flex-col items-start gap-4 overflow-hidden rounded-3xl p-6 text-white shadow-soft sm:flex-row sm:items-center sm:p-7">
        <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-300 to-brand-400 font-display text-2xl font-extrabold text-brand-950 ring-4 ring-white/15">
          {initials(profile.firstName ? `${profile.firstName} ${profile.lastName}` : profile.email)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-extrabold">{displayName({ ...user, ...profile })}</h2>
          <p className="truncate text-sm text-brand-200/80">{profile.email || '—'}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Badge className="border-0 bg-lime-400 text-brand-950">{user?.role === 'ADMIN' ? 'Administrator' : 'Trader account'}</Badge>
            {profile.company && <Badge className="border-white/20 bg-white/10 text-white">{profile.company}</Badge>}
            {(profile.city || profile.country) && (
              <Badge className="border-white/20 bg-white/10 text-white">
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Profile details</CardTitle>
          <CardDescription>Used on your cost sheets and PDF quotations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="firstName">
              <Input id="firstName" value={profile.firstName} onChange={set('firstName')} autoComplete="given-name" />
            </FormField>
            <FormField label="Last name" htmlFor="lastName">
              <Input id="lastName" value={profile.lastName} onChange={set('lastName')} autoComplete="family-name" />
            </FormField>
            <FormField label="Email" htmlFor="email" hint="Email is your login ID and can't be changed here.">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" value={profile.email} readOnly className="pl-10 opacity-70" />
              </div>
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" value={profile.phone} onChange={set('phone')} className="pl-10" autoComplete="tel" />
              </div>
            </FormField>
            <FormField label="Company" htmlFor="company">
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="company" value={profile.company} onChange={set('company')} className="pl-10" autoComplete="organization" />
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" htmlFor="city">
                <Input id="city" value={profile.city} onChange={set('city')} autoComplete="address-level2" />
              </FormField>
              <FormField label="Country" htmlFor="country">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="country" value={profile.country} onChange={set('country')} className="pl-9" autoComplete="country-name" />
                </div>
              </FormField>
            </div>
          </div>
          <Button onClick={saveProfile} className="mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" /> Save profile
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MonitorSmartphone className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Appearance</CardTitle>
            <CardDescription>Choose how FreshmCalc looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
              {(
                [
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: MonitorSmartphone },
                ] as Array<{ value: ThemePreference; label: string; icon: React.ElementType }>
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={preference === opt.value}
                  onClick={() => setPreference(opt.value)}
                  className={cn(
                    'flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border text-sm font-bold transition-all active:scale-[0.97]',
                    preference === opt.value
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/25 dark:border-brand-500 dark:bg-brand-950 dark:text-brand-200'
                      : 'border-border bg-card text-muted-foreground hover:border-brand-300 dark:hover:border-brand-700'
                  )}
                >
                  <opt.icon className="h-5 w-5" />
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Dark mode uses a deep-forest palette that's easy on the eyes during early-morning market checks.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BellRing className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Notifications</CardTitle>
            <CardDescription>Stay on top of the market and your billing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow
              title="Daily Dubai rate digest"
              desc="A morning summary of fresh AED prices."
              checked={notifyRates}
              onChange={(v) => toggleNotify('rates', v)}
            />
            <ToggleRow
              title="Billing & renewal alerts"
              desc="Reminders before your plan period ends."
              checked={notifyBilling}
              onChange={(v) => toggleNotify('billing', v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Security</CardTitle>
          <CardDescription>Password resets are handled over verified email for your safety.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed dark:bg-brand-950/70 sm:flex-row sm:items-center">
            <p className="flex-1 text-muted-foreground">
              Need a new password? Write to <strong className="text-foreground">support@freshmcalc.com</strong> from your
              registered email and we'll send you a secure reset link.
            </p>
            <Button asChild variant="outline" className="shrink-0">
              <a href="mailto:support@freshmcalc.com?subject=Password%20reset%20request">Email support</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <div className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50/60 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h3 className="font-display text-[15px] font-bold text-red-800 dark:text-red-300">Sign out of FreshmCalc</h3>
          <p className="text-sm text-red-700/80 dark:text-red-300/70">You'll need to sign in again to see live Dubai rates on this device.</p>
        </div>
        <Button variant="destructive" onClick={logout} className="w-full shrink-0 sm:w-auto">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-950/50">
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[13px] text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-brand-600' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-300',
            checked ? 'left-[24px]' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}
