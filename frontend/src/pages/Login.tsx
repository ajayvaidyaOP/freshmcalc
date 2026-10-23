'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, Eye, EyeOff, FlaskConical, Loader2, Lock, Mail, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout, FormField } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { apiError, isServerUnreachable, setAuth } from '@/lib/api';
import { disableDemo, enableDemo } from '@/lib/demo';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Values = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [serverDown, setServerDown] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const openDemo = () => {
    enableDemo();
    window.location.href = '/dashboard';
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    setError(null);
    setServerDown(false);
    try {
      // A real sign-in must always reach the backend. If demo mode was left
      // on by an earlier "Explore live demo" tap, its local adapter would
      // otherwise answer this login itself with a fake trader (CUSTOMER)
      // session — and even an ADMIN would land in the demo trader view.
      disableDemo();
      const res = await authService.login(data.email, data.password);
      setAuth(res.token, { email: res.email, role: res.role, status: res.status });
      // Land each account on its own home: admins manage the platform,
      // traders go to the market overview. The role comes from the backend
      // login response (and /auth/me re-checks it) — never from the email.
      const isAdmin = res.role === 'ADMIN';
      toast({
        title: 'Welcome back!',
        description: isAdmin ? 'Admin dashboard is ready.' : 'Dubai market overview is ready.',
        variant: 'success',
      });
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (e: any) {
      if (isServerUnreachable(e)) {
        setServerDown(true);
      } else {
        setError(apiError(e, 'Login failed. Please check your email and password.'));
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to view Dubai market rates in AED and your saved export cost sheets."
      footer={
        <>
          New to FreshmCalc?{' '}
          <Link to="/register" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Create a free account
          </Link>
        </>
      }
    >
      {serverDown && (
        <div role="alert" className="mb-5 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 animate-fade-in dark:border-amber-700/50 dark:bg-amber-950/40">
          <div className="flex items-start gap-2.5">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <p className="font-bold text-amber-900 dark:text-amber-200">The server cannot be reached</p>
              <p className="mt-0.5 leading-relaxed text-amber-800/85 dark:text-amber-200/75">
                Your email/password may be correct — but the backend server isn't running in this preview, so login
                can't be verified. Explore the full app with sample data instead:
              </p>
            </div>
          </div>
          <Button type="button" size="lg" className="mt-3.5 w-full" onClick={openDemo}>
            <FlaskConical className="h-5 w-5" /> Try the sample demo — no account needed
          </Button>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-2xl border border-destructive/25 bg-destructive/[0.07] p-3.5 text-sm font-medium text-destructive animate-fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@company.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-10 pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Just exploring?</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full border-brand-300 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-950/60"
        onClick={openDemo}
      >
        <FlaskConical className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        Try sample demo — no account needed
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Opens the full app with sample Dubai data. Switch to <strong>Admin view</strong> from the green demo banner inside.
      </p>

      <p className="mt-5 rounded-xl bg-brand-50 px-3.5 py-2.5 text-center text-xs font-medium leading-relaxed text-brand-800 dark:bg-brand-950 dark:text-brand-200">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1 font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
        >
          Forgot your password?
        </Link>
      </p>
    </AuthLayout>
  );
}
