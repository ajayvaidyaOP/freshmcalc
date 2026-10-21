import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Calculator, LineChart } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

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
              Join fruit & vegetable traders who check live Dubai wholesale rates and lock their India → Dubai costing before the container is sealed.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: LineChart, text: 'Live Dubai rates with freshness time on every price' },
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
              <div className="mt-6">{children}</div>
            </div>
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </main>
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
