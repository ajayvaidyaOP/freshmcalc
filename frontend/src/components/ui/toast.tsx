'use client';

// Toast notifications are rendered by <Toaster /> and triggered via the
// `toast()` helper from '@/hooks/use-toast'. This module re-exports them
// so existing imports keep working.
export { Toaster } from '@/components/ui/toaster';
export { toast, useToast } from '@/hooks/use-toast';
