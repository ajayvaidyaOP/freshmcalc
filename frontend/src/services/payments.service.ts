import { api } from '@/lib/api';

export const paymentsService = {
  record: (params: any) => api.post('/payments/record', null, { params }).then((r) => r.data),
};
