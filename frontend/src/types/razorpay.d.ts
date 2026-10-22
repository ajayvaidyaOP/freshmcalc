export {};

declare global {
  interface Window {
    /** Loaded on demand from checkout.razorpay.com — web checkout only. */
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}
