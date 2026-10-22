import { api } from '@/lib/api';

export const subscriptionsService = {
  listPlans: () => api.get('/subscription-plans').then((r) => r.data),
  getActive: () => api.get('/subscription-plans/subscription').then((r) => r.data),
};
