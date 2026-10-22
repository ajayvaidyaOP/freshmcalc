'use client';

import * as React from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isIOS, isNativeApp, isSafari, isStandalone } from '@/lib/platform';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'freshmcalc_install_dismissed_at';
const DISMISS_DAYS = 21;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Install card for the PWA. Hidden inside the native app and when already
 * installed. Android/Chrome uses the native install prompt; iOS/Safari shows
 * the Share → Add to Home Screen instruction (Apple has no install API).
 */
export function InstallPrompt({ className }: { className?: string }) {
  const [mode, setMode] = React.useState<'install' | 'ios' | null>(null);
  const deferred = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = React.useState(false);

  React.useEffect(() => {
    if (isNativeApp() || isStandalone()) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
      window.setTimeout(() => setMode('install'), 2500);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => setMode(null);
    window.addEventListener('appinstalled', onInstalled);

    // iOS Safari never fires beforeinstallprompt.
    const timer = window.setTimeout(() => {
      if (!deferred.current && isIOS() && isSafari()) setMode('ios');
    }, 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setMode(null);
  };

  const install = async () => {
    const prompt = deferred.current;
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
      setMode(null);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3.5 overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50 to-card p-4 shadow-soft dark:border-brand-800/60 dark:from-brand-950/60 dark:to-card',
        className
      )}
      role="region"
      aria-label="Install FreshmCalc"
    >
      <img
        src="/icons/icon-192.png"
        alt=""
        width={46}
        height={46}
        className="h-[46px] w-[46px] shrink-0 rounded-xl shadow-soft"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[14.5px] font-bold leading-snug">
          {mode === 'ios' ? 'Add FreshmCalc to your Home Screen' : 'Install the FreshmCalc app'}
        </p>
        {mode === 'ios' ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[12px] leading-relaxed text-muted-foreground">
            Tap <Share className="inline h-3.5 w-3.5" /> Share, then
            <span className="inline-flex items-center gap-1 font-bold text-foreground">
              <Smartphone className="h-3.5 w-3.5" /> Add to Home Screen
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            Opens full-screen, loads faster and keeps your calculator draft on the phone.
          </p>
        )}
        {mode === 'install' && (
          <Button type="button" size="sm" onClick={install} disabled={installing} className="mt-2.5">
            <Download className="h-4 w-4" /> {installing ? 'Opening…' : 'Install app'}
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Not now"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
