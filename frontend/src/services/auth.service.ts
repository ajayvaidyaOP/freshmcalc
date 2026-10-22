import { api } from '@/lib/api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (data: any) =>
    api.post('/auth/register', data).then((r) => r.data),
  /** Full profile + plan entitlements. */
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    country?: string;
    city?: string;
  }) => api.patch('/auth/me', data).then((r) => r.data),
  /** Store-required account deletion (server anonymises the account). */
  deleteAccount: () => api.delete('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),
};
