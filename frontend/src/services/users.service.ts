import { api } from '@/lib/api';

export const usersService = {
  listUsers: () => api.get('/admin/users').then((r) => r.data),
};
