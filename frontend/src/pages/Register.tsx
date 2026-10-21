'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Phone, Building, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { setAuth } from '@/lib/api';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.register(data);
      setAuth(res.token, { email: res.email, role: res.role, status: res.status });
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join as a trader or exporter to access Dubai market rates and export costing.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First name</Label><Input {...register('firstName')} /></div>
              <div className="space-y-2"><Label>Last name</Label><Input {...register('lastName')} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input {...register('email')} type="email" />{errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}</div>
            <div className="space-y-2"><Label>Password</Label><Input {...register('password')} type="password" />{errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input {...register('phone')} /></div>
              <div className="space-y-2"><Label>Company</Label><Input {...register('company')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Country</Label><Input {...register('country')} defaultValue="India" /></div>
              <div className="space-y-2"><Label>City</Label><Input {...register('city')} /></div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            <ArrowRight size={14} className="mr-1" /> Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
