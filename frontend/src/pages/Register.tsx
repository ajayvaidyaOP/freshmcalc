'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowRight, Building2, Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout, FormField } from '@/components/layout/AuthLayout';
import { authService } from '@/services/auth.service';
import { apiError, setAuth } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'At least 6 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { country: 'India' } });

  const onSubmit = async (data: Values) => {
    setError(null);
    try {
      const res = await authService.register(data);
      setAuth(res.token, {
        email: res.email,
        role: res.role,
        status: res.status,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        country: data.country,
        city: data.city,
      });
      toast({ title: 'Account created!', description: 'Welcome to FreshmCalc. Choose a plan to unlock live Dubai rates.', variant: 'success' });
      navigate('/dashboard');
    } catch (e: any) {
      setError(apiError(e, 'Registration failed. Please try again.'));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="For traders, wholesalers & exporters shipping fresh produce from India to Dubai."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
            Sign in
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
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="firstName" autoComplete="given-name" placeholder="Ravi" className="pl-10" {...register('firstName')} />
            </div>
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
            <Input id="lastName" autoComplete="family-name" placeholder="Patil" {...register('lastName')} />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="name@company.com" className="pl-10" {...register('email')} />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="Use at least 6 characters.">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
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

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone (optional)" htmlFor="phone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91…" className="pl-10" {...register('phone')} />
            </div>
          </FormField>
          <FormField label="Company (optional)" htmlFor="company">
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="company" autoComplete="organization" placeholder="ABC Exports" className="pl-10" {...register('company')} />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Country" htmlFor="country">
            <Input id="country" autoComplete="country-name" {...register('country')} />
          </FormField>
          <FormField label="City" htmlFor="city">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="city" autoComplete="address-level2" placeholder="Nashik" className="pl-10" {...register('city')} />
            </div>
          </FormField>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create free account <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-semibold underline underline-offset-4 hover:text-foreground">
            terms of service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-semibold underline underline-offset-4 hover:text-foreground">
            privacy policy
          </Link>
          . Subscription plans from ₹499/month unlock live Dubai rates.
        </p>
      </form>
    </AuthLayout>
  );
}
