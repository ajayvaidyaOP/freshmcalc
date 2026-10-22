/** Runtime helpers for the installable app / Capacitor shells. */

/** True when running inside the Android/iOS Capacitor wrapper. */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  const capacitor = (window as any).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
}

/** True for an installed PWA (home-screen app) on web. */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports Macintosh but has touch points.
  return iOSDevice || (ua.includes('Macintosh') && (navigator as any).maxTouchPoints > 1);
}

export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
}

/** Safari (needed for the “Add to Home Screen” instructions). */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|Edg|OPR/i.test(ua);
}

/** Platform label used on Settings → About app. */
export function platformLabel(): string {
  if (isNativeApp()) return isIOS() ? 'iOS app' : 'Android app';
  if (isStandalone()) return 'Installed web app';
  return 'Browser';
}
