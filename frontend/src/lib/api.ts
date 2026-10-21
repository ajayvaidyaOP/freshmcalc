/// <reference types="vite/client" />
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('freshmcalc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('freshmcalc_token');
      localStorage.removeItem('freshmcalc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function setAuth(token: string, user: any) {
  localStorage.setItem('freshmcalc_token', token);
  localStorage.setItem('freshmcalc_user', JSON.stringify(user));
}

export function getAuth() {
  const token = localStorage.getItem('freshmcalc_token');
  const userRaw = localStorage.getItem('freshmcalc_user');
  return { token, user: userRaw ? JSON.parse(userRaw) : null };
}

export function clearAuth() {
  localStorage.removeItem('freshmcalc_token');
  localStorage.removeItem('freshmcalc_user');
}
