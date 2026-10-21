import * as React from 'react';

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends ToastInput {
  id: number;
  open: boolean;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(input: ToastInput) {
  const id = nextId++;
  const item: ToastItem = { id, open: true, duration: 4200, variant: 'default', ...input };
  toasts = [...toasts.slice(-3), item];
  emit();
  window.setTimeout(() => dismissToast(id), item.duration);
  return id;
}

export function dismissToast(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 250);
}

export function useToast() {
  const [items, setItems] = React.useState<ToastItem[]>(toasts);
  React.useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  return { toasts: items, toast, dismiss: dismissToast };
}
