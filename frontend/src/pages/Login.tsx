'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, Eye, EyeOff, FlaskConical, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout, FormField } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { apiError, setAuth } from '@/lib/api';
import { enableDemo } from '@/lib/demo';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Values = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    setError(null);
    try {
      const res = await authService.login(data.email, data.password);
      setAuth(res.token, { email: res.email, role: res.role, status: res.status });
      toast({ title: 'Welcome back!', description: 'Dubai market overview is ready.', variant: 'success' });
      navigate('/dashboard');
    } catch (e: any) {
      setError(apiError(e, 'Login failed. Please check your email and password.'));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see live Dubai rates (AED) and your saved export cost sheets."
      footer={
        <>
          New to FreshmCalc?{' '}
          <Link to="/register" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Create a free account
          </Link>
        </>
      }
    >
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
              Sign in to dashboard <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 rounded-xl bg-brand-50 px-3.5 py-2.5 text-center text-xs font-medium leading-relaxed text-brand-800 dark:bg-brand-950 dark:text-brand-200">
        Forgot your password? Write to support@freshmcalc.com and we'll help you reset it.
      </p>
    </AuthLayout>
  );
}
