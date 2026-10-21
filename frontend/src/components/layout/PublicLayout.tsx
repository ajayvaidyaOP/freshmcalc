'use client';

import * as React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { getAuth } from '@/lib/api';

const NAV_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Live Rates', to: '/#live-rates' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/#faq' },
];

export function PublicLayout() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();
  const { token } = getAuth();

  React.useEffect(() => setOpen(false), [location.pathname, location.hash]);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Announcement bar */}
      <div className="surface-forest px-4 py-2 text-center text-[12.5px] font-semibold text-brand-100">
        <span className="mr-2 hidden rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-950 sm:inline-block">
          New
        </span>
        Dubai wholesale rates now updated daily in AED —{' '}
        <Link to="/pricing" className="text-lime-300 underline-offset-2 hover:underline">
          see plans from ₹499/mo
        </Link>
      </div>

      {/* Header */}
      <header
        className={cn(
          'glass sticky top-0 z-50 border-b transition-shadow duration-300',
          scrolled ? 'border-border/80 shadow-soft' : 'border-transparent'
        )}
      >
        <div className="container flex h-[68px] items-center gap-3">
          <Logo to="/" />
          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-800 dark:hover:bg-brand-950 dark:hover:text-brand-200',
                    isActive && link.to === '/pricing' && 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ThemeToggle className="hidden sm:flex" />
            {token ? (
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/dashboard">
                  Open dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/register">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:border-brand-300 active:scale-95 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-border/70 px-4 pb-5 pt-3 animate-fade-in lg:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className="flex min-h-[48px] items-center justify-between rounded-xl px-3 text-[15px] font-semibold transition-colors hover:bg-brand-50 hover:text-brand-800 dark:hover:bg-brand-950"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {token ? (
                <Button asChild size="lg" className="col-span-2">
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="surface-forest text-brand-100">
        <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo to="/" tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200/80">
              Live Dubai fresh-produce market rates in AED and a complete India → Dubai export costing engine for traders, wholesalers and exporters.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold ring-1 ring-white/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-lime-300 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-lime-300" />
              </span>
              Dubai market · AED · Updated daily
            </div>
          </div>

          <nav aria-label="Product">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-brand-200/85">
              <li><Link className="transition-colors hover:text-lime-300" to="/#features">Features</Link></li>
              <li><Link className="transition-colors hover:text-lime-300" to="/#live-rates">Live Dubai rates</Link></li>
              <li><Link className="transition-colors hover:text-lime-300" to="/#how-it-works">Export calculator</Link></li>
              <li><Link className="transition-colors hover:text-lime-300" to="/pricing">Pricing</Link></li>
            </ul>
          </nav>

          <nav aria-label="Account">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-brand-200/85">
              <li><Link className="transition-colors hover:text-lime-300" to="/register">Create account</Link></li>
              <li><Link className="transition-colors hover:text-lime-300" to="/login">Log in</Link></li>
              <li><Link className="transition-colors hover:text-lime-300" to="/#faq">FAQ</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Trade corridor</h3>
            <ul className="mt-4 space-y-3 text-sm text-brand-200/85">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" /> India (sourcing) → Jebel Ali Port, Dubai, UAE (selling market)</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" /> support@freshmcalc.com</li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" /> Mon–Sat, 9:00–19:00 IST</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-brand-200/60 sm:flex-row sm:text-left">
            <p>© {new Date().getFullYear()} FreshmCalc. All rights reserved.</p>
            <p>All selling prices shown are Dubai, UAE (AED). Indian domestic prices are never presented as Dubai rates.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
