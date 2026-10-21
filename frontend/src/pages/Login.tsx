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
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { setAuth } from '@/lib/api';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.login(data.email, data.password);
      setAuth(res.token, { email: res.email, role: res.role, status: res.status });
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to access Dubai market rates and your export cost sheets.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register('email')} placeholder="name@company.com" />
              {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input {...register('password')} type="password" />
              {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">Create an account</Link>
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
