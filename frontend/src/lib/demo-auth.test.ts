import { beforeEach, describe, expect, it, vi } from 'vitest';
import { disableDemo, enableDemo, isDemoMode } from './demo';
import { clearAuth, getAuth, setAuth } from './api';

/**
 * Regression tests for "admin login shows the trader (demo) dashboard".
 *
 * Root cause: demo mode (`freshmcalc_demo=1`) survived logout and real
 * sign-ins, so the axios layer kept answering /auth/login locally with a
 * fake CUSTOMER session. Real auth must always end demo mode.
 */

// Vitest runs in Node here — provide a minimal in-memory localStorage.
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

beforeEach(() => store.clear());

describe('demo mode vs real auth', () => {
  it('disableDemo turns demo mode off', () => {
    enableDemo();
    expect(isDemoMode()).toBe(true);
    disableDemo();
    expect(isDemoMode()).toBe(false);
  });

  it('setAuth (real login) ends demo mode and keeps the backend role', () => {
    enableDemo(); // leftover flag from an earlier "Explore live demo" tap
    setAuth('real-jwt', { email: 'admin@freshmcalc.com', role: 'ADMIN', status: 'ACTIVE' });
    expect(isDemoMode()).toBe(false);
    expect(getAuth().token).toBe('real-jwt');
    expect(getAuth().user.role).toBe('ADMIN');
  });

  it('clearAuth (logout / demo Exit) ends demo mode', () => {
    enableDemo();
    clearAuth();
    expect(isDemoMode()).toBe(false);
    expect(getAuth().token).toBeNull();
    expect(getAuth().user).toBeNull();
  });

  it('enableDemo still works for the labelled sample-data preview', () => {
    enableDemo('ADMIN');
    expect(isDemoMode()).toBe(true);
    expect(getAuth().user.role).toBe('ADMIN');
    expect(getAuth().user.email).toBe('demo@freshmcalc.com');
  });
});
