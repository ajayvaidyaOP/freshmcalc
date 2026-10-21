import * as React from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'freshmcalc_theme';

function applyTheme(pref: ThemePreference) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = pref === 'dark' || (pref === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'system';
    } catch {
      return 'system';
    }
  });
  const [isDark, setIsDark] = React.useState<boolean>(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const setPreference = React.useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* storage unavailable */
    }
    applyTheme(pref);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (preference === 'system') {
        applyTheme('system');
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const toggle = React.useCallback(() => {
    setPreference(isDark ? 'light' : 'dark');
  }, [isDark, setPreference]);

  return { preference, setPreference, isDark, toggle };
}
