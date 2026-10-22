import * as React from 'react';
import { USER_EVENT, getAuth } from '@/lib/api';

/**
 * Live copy of the signed-in user (profile + plan entitlements).
 * MainLayout refreshes /auth/me and emits USER_EVENT, so screens that read the
 * plan unlock themselves immediately after a payment — no reload needed.
 */
export function useCurrentUser() {
  const [user, setUser] = React.useState<any>(() => getAuth().user);

  React.useEffect(() => {
    const onUser = (event: Event) => setUser((event as CustomEvent).detail);
    window.addEventListener(USER_EVENT, onUser);
    return () => window.removeEventListener(USER_EVENT, onUser);
  }, []);

  return user;
}
