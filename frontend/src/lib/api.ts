/// <reference types="vite/client" />
import axios from 'axios';
import { demoAdapter, disableDemo } from './demo';

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
  // A real backend session replaces demo mode. Without this, a leftover
  // demo flag would keep intercepting API calls (including /auth/me) and
  // the signed-in user — e.g. an ADMIN — would stay stuck in sample data.
  disableDemo();
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
  // Signing out (or exiting the demo banner, which calls this) must also
  // end demo mode — otherwise the flag survives forever and silently
  // intercepts the next real login.
  disableDemo();
}

export const USER_EVENT = 'freshmcalc:user';

/**
 * Pull the full profile (name, company, plan entitlements, active
 * subscription) from /auth/me and refresh the cached user. Emits USER_EVENT so
 * the app shell unlocks features immediately after a payment.
 */
export async function refreshUser(): Promise<any | null> {
  if (localStorage.getItem('freshmcalc_demo') === '1') return null;
  if (!localStorage.getItem('freshmcalc_token')) return null;
  try {
    const { data } = await api.get('/auth/me');
    localStorage.setItem('freshmcalc_user', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(USER_EVENT, { detail: data }));
    return data;
  } catch {
    return null;
  }
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
  if (err?.response?.data?.fieldErrors) {
    const first = Object.values(err.response.data.fieldErrors)[0];
    if (typeof first === 'string') return first;
  }
  // Plain JS errors (e.g. "payment window could not load") — use their message.
  if (!err?.isAxiosError && err instanceof Error && err.message) return err.message;
  if (isServerUnreachable(err)) return 'Cannot reach the FreshmCalc server. Please make sure the backend is running.';
  return fallback;
}
