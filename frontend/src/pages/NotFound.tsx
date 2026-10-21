import { Link } from 'react-router-dom';
import { ArrowLeft, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-dots flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 scale-150 rounded-full bg-brand-200/60 blur-2xl dark:bg-brand-900/50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lift">
          <Sprout className="h-10 w-10" strokeWidth={1.6} />
        </div>
      </div>
      <p className="font-display text-6xl font-extrabold tracking-tight text-brand-700 dark:text-brand-300">404</p>
      <h1 className="mt-3 text-2xl font-extrabold">This crate is empty</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you are looking for doesn't exist or may have been moved. Let's get you back to fresh rates.
      </p>
      <Button asChild size="lg" className="mt-7">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </Button>
    </div>
  );
}
