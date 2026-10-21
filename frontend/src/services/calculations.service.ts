import { api } from '@/lib/api';

export const calculationsService = {
  create: (data: any) => api.post('/calculations', data).then((r) => r.data),
  get: (id: number) => api.get(`/calculations/${id}`).then((r) => r.data),
  list: () => api.get('/calculations').then((r) => r.data),
  remove: (id: number) => api.delete(`/calculations/${id}`).then((r) => r.data),
};
