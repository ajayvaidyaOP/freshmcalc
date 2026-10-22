import { api } from '@/lib/api';

export const ratesService = {
  listPublished: () => api.get('/rates').then((r) => r.data),
  listAll: () => api.get('/rates/admin').then((r) => r.data),
  listHistory: () => api.get('/rates/history').then((r) => r.data),
  getRate: (id: number) => api.get(`/rates/${id}`).then((r) => r.data),
  createRate: (data: any) => api.post('/rates', data).then((r) => r.data),
  updateRate: (id: number, data: any) => api.put(`/rates/${id}`, data).then((r) => r.data),
  publishRate: (id: number, data: any) => api.post(`/rates/${id}/publish`, data).then((r) => r.data),
  markStale: (id: number) => api.post(`/rates/${id}/stale`).then((r) => r.data),
};
