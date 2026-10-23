import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Calculator, FlaskConical, LineChart, WifiOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { api, isServerUnreachable } from '@/lib/api';
import { enableDemo } from '@/lib/demo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Split-screen auth shell: brand story panel on desktop/tablet landscape,
 * compact branded header on phones.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <img src="/images/fresh-export.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/95 via-brand-950/70 to-brand-900/30" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <Logo to="/" tone="light" />
          <div>
            <h2 className="max-w-lg font-display text-4xl font-extrabold leading-[1.15]">
              Dubai prices in AED. <span className="text-lime-300">Profit before dispatch.</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-brand-100/85">
              Join produce traders who review publisher-updated Dubai wholesale rates and prepare an India → Dubai cost estimate before dispatch.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: LineChart, text: 'Dubai market rates with an update time on every price' },
                { icon: Calculator, text: 'Landed cost per box, kg & tonne — INR → AED built in' },
                { icon: BadgeCheck, text: 'Professional PDF quotations your buyers trust' },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                    <f.icon className="h-5 w-5 text-lime-300" />
                  </span>
                  <span className="text-[15px] font-semibold">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs font-semibold text-brand-200/60">
            JNPA · Mundra · Chennai → Jebel Ali, Dubai · All selling prices in AED
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="bg-dots relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-800 dark:hover:bg-brand-950 dark:hover:text-brand-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex items-center gap-2">
            <span className="lg:hidden">
              <Logo to="/" />
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-8">
          <div className="w-full max-w-[440px] animate-fade-up">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-lift sm:p-8">
              <h1 className="font-display text-[26px] font-extrabold leading-tight">{title}</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
              <ServerStatusBanner />
              <div className="mt-6">{children}</div>
            </div>
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Pings a public API endpoint once; if the backend is unreachable (e.g. this
 * is a frontend-only preview), shows a friendly notice with a demo shortcut
 * instead of letting the user hit a confusing "login failed" error.
 */
function ServerStatusBanner() {
  const [down, setDown] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    api
      .get('/rates', { timeout: 4000 })
      .catch((err) => {
        if (!cancelled && isServerUnreachable(err)) setDown(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!down) return null;

  return (
    <div
      role="status"
      className="mt-5 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 animate-fade-in dark:border-amber-700/50 dark:bg-amber-950/40"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
          <WifiOff className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Backend server is not connected</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-amber-800/85 dark:text-amber-200/75">
            Login needs the FreshmCalc server running. In this preview only the website is live — explore the full
            app with sample Dubai data instead:
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          enableDemo();
          window.location.href = '/dashboard';
        }}
        className="mt-3.5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 text-sm font-bold text-white shadow-soft transition-all hover:from-brand-500 hover:to-brand-600 active:scale-[0.98]"
      >
        <FlaskConical className="h-[18px] w-[18px]" /> Try the sample demo — no account needed
      </button>
    </div>
  );
}

/** Label + control + error wrapper shared by auth and app forms. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-foreground/90">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
