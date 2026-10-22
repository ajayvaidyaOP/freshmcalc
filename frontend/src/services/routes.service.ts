import { api } from '@/lib/api';

export const routesService = {
  listRoutes: () => api.get('/routes').then((r) => r.data),
  createRoute: (data: any) => api.post('/routes', data).then((r) => r.data),
  listFreightQuotes: () => api.get('/routes/freight-quotes').then((r) => r.data),
  createFreightQuote: (data: any) => api.post('/routes/freight-quotes', data).then((r) => r.data),
};
