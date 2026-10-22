import { api } from '@/lib/api';

/**
 * Razorpay checkout is server-driven:
 *  1. /payments/order  → amount + order id come from the plan price in the DB
 *  2. /payments/verify → server verifies the signature and activates the plan
 */
export const paymentsService = {
  createOrder: (planId: number) => api.post('/payments/order', { planId }).then((r) => r.data),
  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post('/payments/verify', data).then((r) => r.data),
};
