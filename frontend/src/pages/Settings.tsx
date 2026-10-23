'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BellRing,
  Building2,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MonitorSmartphone,
  Moon,
  Phone,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/layout/AuthLayout';
import { apiError, clearAuth, getAuth, refreshUser } from '@/lib/api';
import { authService } from '@/services/auth.service';
import { isDemoMode } from '@/lib/demo';
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
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  // Login only returns email/role; hydrate the real profile from the server so
  // the form never shows blanks (and a save can't wipe stored details).
  React.useEffect(() => {
    if (isDemoMode()) return;
    let cancelled = false;
    authService
      .me()
      .then((me) => {
        if (cancelled || !me) return;
        setProfile({
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          email: me.email || '',
          phone: me.phone || '',
          company: me.company || '',
          country: me.country || 'India',
          city: me.city || '',
        });
      })
      .catch(() => {
        /* offline — keep the cached values */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  /** Persist to the server so the change follows the user to every device. */
  const saveProfile = async () => {
    if (isDemoMode()) {
      toast({ title: 'Demo mode', description: 'Profile changes are not saved in the demo.' });
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phone: profile.phone.trim(),
        company: profile.company.trim(),
        country: profile.country.trim(),
        city: profile.city.trim(),
      });
      localStorage.setItem('freshmcalc_user', JSON.stringify(updated));
      setProfile((p) => ({ ...p, ...updated, email: updated.email || p.email }));
      await refreshUser();
      toast({ title: 'Profile saved', description: 'Your details are updated on the server.', variant: 'success' });
    } catch (e: any) {
      toast({
        title: 'Could not save profile',
        description: apiError(e, 'Please check your connection and try again.'),
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm.trim().toUpperCase() !== 'DELETE') return;
    setDeleting(true);
    try {
      await authService.deleteAccount();
      clearAuth();
      toast({
        title: 'Account deleted',
        description: 'Your account, cost sheets and plan have been removed. Payment records are kept for accounting only.',
        variant: 'success',
      });
      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Could not delete account',
        description: apiError(e, 'Please try again or email support@freshmcalc.com.'),
        variant: 'destructive',
      });
      setDeleting(false);
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
          <Button onClick={saveProfile} disabled={savingProfile} className="mt-6 w-full sm:w-auto">
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingProfile ? 'Saving…' : 'Save profile'}
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
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Password & security</CardTitle>
          <CardDescription>A reset link is emailed to your registered address and expires in 30 minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed dark:bg-brand-950/70 sm:flex-row sm:items-center">
            <p className="flex-1 text-muted-foreground">
              We'll send a one-time link to <strong className="text-foreground">{profile.email || 'your email'}</strong>.
              Your current password stays valid until you choose a new one.
            </p>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/forgot-password">Send reset link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Legal & data
          </CardTitle>
          <CardDescription>How FreshmCalc handles your account and business data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/privacy">
              <ShieldCheck className="h-4 w-4" /> Privacy policy
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/terms">
              <FileText className="h-4 w-4" /> Terms of service
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Sign out */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h3 className="font-display text-[15px] font-bold">Sign out of FreshmCalc</h3>
          <p className="text-sm text-muted-foreground">You'll need to sign in again to view Dubai market rates on this device.</p>
        </div>
        <Button variant="outline" onClick={logout} className="w-full shrink-0 sm:w-auto">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Danger zone */}
      <div className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50/60 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-red-800 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" /> Delete account
          </h3>
          <p className="text-sm leading-relaxed text-red-700/80 dark:text-red-300/70">
            Permanently deletes your profile, saved cost sheets and active plan. Payment records are kept for
            accounting. This cannot be undone.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="w-full shrink-0 sm:w-auto">
          <Trash2 className="h-4 w-4" /> Delete account
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your FreshmCalc account?</DialogTitle>
            <DialogDescription>
              This removes your profile, all saved cost sheets and cancels any active plan immediately. Your email is
              anonymised and you can sign up again later with the same address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="delete-confirm" className="text-[13px] font-bold">
              Type <span className="font-mono text-red-600">DELETE</span> to confirm
            </label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={deleting || deleteConfirm.trim().toUpperCase() !== 'DELETE'}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
