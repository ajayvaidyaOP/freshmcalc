import { api } from '@/lib/api';

export const portsService = {
  listPorts: () => api.get('/ports').then((r) => r.data),
  createPort: (data: any) => api.post('/ports', data).then((r) => r.data),
};
