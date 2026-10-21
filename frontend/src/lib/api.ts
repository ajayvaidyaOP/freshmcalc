/// <reference types="vite/client" />
import axios from 'axios';

/**
 * Backend controllers are mounted under /api/v1 (see Spring @RequestMapping).
 * Nginx and the Vite dev proxy both forward /api/* to the backend as-is.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('freshmcalc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Demo mode: serve clearly-labelled sample data without a backend.
  if (localStorage.getItem('freshmcalc_demo') === '1') {
    const { demoAdapter } = await import('./demo');
    config.adapter = demoAdapter as any;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only force-logout on a real 401 for an existing session, and never
    // redirect while already on an auth/public page (avoids redirect loops).
    const path = window.location.pathname;
    const onPublicPage = ['/', '/login', '/register', '/pricing'].includes(path);
    if (err.response?.status === 401 && localStorage.getItem('freshmcalc_token') && !onPublicPage) {
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
  try {
    return { token, user: userRaw ? JSON.parse(userRaw) : null };
  } catch {
    return { token, user: null };
  }
}

export function clearAuth() {
  localStorage.removeItem('freshmcalc_token');
  localStorage.removeItem('freshmcalc_user');
}

/** True when the backend can't be reached at all (offline / proxy 5xx), vs a real API error. */
export function isServerUnreachable(err: any): boolean {
  if (!err?.response) return true; // network error or timeout — no response received
  return Number(err.response.status) >= 500; // dev-proxy / gateway errors while backend is down
}

/** Friendly error message from an Axios error. */
export function apiError(err: any, fallback = 'Something went wrong. Please try again.'): string {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (isServerUnreachable(err)) return 'Cannot reach the FreshmCalc server. Please make sure the backend is running.';
  return fallback;
}
