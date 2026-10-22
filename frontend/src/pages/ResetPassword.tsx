'use client';

import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout, FormField } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { apiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type Values = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    setError(null);
    try {
      await authService.resetPassword(token, data.newPassword);
      setDone(true);
      toast({ title: 'Password updated', description: 'Sign in with your new password.', variant: 'success' });
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (e: any) {
      setError(apiError(e, 'This reset link is invalid or has expired. Request a new one.'));
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link is incomplete"
        subtitle="This reset link is missing its token."
        footer={
          <Link to="/login" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-300/70 bg-amber-50 p-6 text-center dark:border-amber-800/50 dark:bg-amber-950/40">
          <AlertTriangle className="h-9 w-9 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Open the link from your email exactly as written, or request a fresh one.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout
        title="Password changed"
        subtitle="Redirecting you to sign in…"
        footer={
          <Link to="/login" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Go to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-6 text-center dark:bg-brand-950/70">
          <CheckCircle2 className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          <p className="text-sm text-muted-foreground">You can now use your new password on every device.</p>
          <Button asChild className="w-full">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Minimum 8 characters. Your other sessions stay signed in."
      footer={
        <Link to="/login" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
          Back to sign in
        </Link>
      }
    >
      {error && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-300/70 bg-red-50 p-3.5 text-sm font-semibold text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <Link to="/forgot-password" className="mt-2 block underline underline-offset-4">
            Request a new link
          </Link>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="newPassword"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              className="pl-10 pr-11"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
