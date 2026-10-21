import { api } from '@/lib/api';

export const productsService = {
  listProducts: () => api.get('/products').then((r) => r.data),
  listVarieties: () => api.get('/products/varieties').then((r) => r.data),
  createProduct: (data: any) => api.post('/products', data).then((r) => r.data),
  createVariety: (data: any) => api.post('/products/varieties', data).then((r) => r.data),
};
