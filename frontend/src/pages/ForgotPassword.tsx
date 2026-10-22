'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout, FormField } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { apiError } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    setError(null);
    try {
      await authService.forgotPassword(data.email.trim().toLowerCase());
      setSentTo(data.email.trim());
    } catch (e: any) {
      setError(apiError(e, 'Could not send the reset link. Please try again.'));
    }
  };

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`If an account exists for ${sentTo}, a reset link is on its way. The link expires in 30 minutes.`}
        footer={
          <Link to="/login" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-6 text-center dark:bg-brand-950/70">
          <CheckCircle2 className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Didn't get it? Check spam, or{' '}
            <button type="button" onClick={() => setSentTo(null)} className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
              try another email
            </button>
            .
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your registered email and we'll send a one-time reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      {error && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-300/70 bg-red-50 p-3.5 text-sm font-semibold text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              className="pl-10"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </div>
        </FormField>
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}
