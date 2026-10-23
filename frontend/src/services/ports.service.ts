import { api } from '@/lib/api';

export const portsService = {
  listPorts: () => api.get('/ports').then((r) => r.data),
  listCountries: () => api.get('/ports/countries').then((r) => r.data),
  listCities: (countryId: number) => api.get('/ports/cities', { params: { countryId } }).then((r) => r.data),
  createPort: (data: any) => api.post('/ports', data).then((r) => r.data),
  listApplicableCharges: (params: Record<string, unknown>) => api.get('/ports/charges', { params }).then((r) => r.data),
  listCharges: () => api.get('/ports/charges/admin').then((r) => r.data),
  createCharge: (data: any) => api.post('/ports/charges', data).then((r) => r.data),
  updateCharge: (id: number, data: any) => api.put(`/ports/charges/${id}`, data).then((r) => r.data),
};
