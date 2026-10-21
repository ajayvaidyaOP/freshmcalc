import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  ChevronDown,
  FileText,
  Globe2,
  History,
  IndianRupee,
  LineChart,
  PlayCircle,
  Quote,
  ShieldCheck,
  Ship,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/common/Reveal';
import { ProductAvatar } from '@/components/common/ProductAvatar';
import { FALLBACK_PLANS, SAMPLE_RATES, SAMPLE_TREND } from '@/lib/sample-data';
import { enableDemo } from '@/lib/demo';
import { formatPaise } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function Landing() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <RatesTicker />
      <Features />
      <LiveRatesPreview />
      <HowItWorks />
      <CorridorBand />
      <Testimonials />
      <PricingTeaser />
      <Faq />
      <CtaBand />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft green glows */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-800/30" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-24 h-[420px] w-[420px] rounded-full bg-lime-300/25 blur-3xl dark:bg-lime-500/10" />
      <div aria-hidden className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="container relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <Badge variant="soft" className="normal-case tracking-normal">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-brand-600" />
            </span>
            Dubai wholesale market · Live AED rates
          </Badge>

          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.08] sm:text-5xl lg:text-[56px]">
            Know your <span className="text-gradient">Dubai selling price</span> before your container sails.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            FreshmCalc gives fruit & vegetable exporters live Dubai market rates in AED and a complete
            India → Dubai costing engine — packing, freight, CHA, duties and commission — so every
            shipment leaves with a known profit margin.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/register">
                Start calculating free <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                enableDemo();
                window.location.href = '/dashboard';
              }}
            >
              <PlayCircle className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Explore live demo
            </Button>
          </div>
          <p className="mt-3 text-[13px] font-semibold text-muted-foreground">
            Demo opens instantly with sample Dubai data — no signup needed.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: '40+', label: 'Products tracked' },
              { value: 'AED', label: 'Dubai market prices' },
              { value: 'Daily', label: 'Rate publishing' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-extrabold text-brand-800 dark:text-brand-200 sm:text-[28px]">{s.value}</dd>
                <dd className="text-xs font-semibold text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Publisher-verified rates</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Secure Razorpay billing</span>
            <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" /> PDF quotations</span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] animate-fade-up [animation-delay:150ms] lg:max-w-none">
      {/* Main app card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lift">
        <div className="surface-forest flex items-center justify-between px-5 py-4 text-white">
          <div>
            <p className="font-display text-sm font-bold">Dubai Market Overview</p>
            <p className="text-xs text-brand-200/80">Al Aweer Wholesale Market · AED</p>
          </div>
          <Badge className="border-0 bg-lime-400 text-brand-950">Sample preview</Badge>
        </div>

        <div className="space-y-1 p-3 sm:p-4">
          {SAMPLE_RATES.slice(0, 4).map((r) => (
            <div key={r.product} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-950/50">
              <ProductAvatar name={r.product} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{r.product}</p>
                <p className="truncate text-xs text-muted-foreground">{r.variety}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold">AED {r.price.toFixed(2)}</p>
                <p className={cn('inline-flex items-center gap-0.5 text-xs font-bold', r.change >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500')}>
                  {r.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {r.change >= 0 ? '+' : ''}{r.change}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border/70 px-5 pb-4 pt-3">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Pomegranate · 7-day trend (AED/box)</span>
            <span className="text-brand-600 dark:text-brand-400">▲ 11.3% this week</span>
          </div>
          <div className="h-[104px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_TREND} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#389d68" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#389d68" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.55 }} dy={4} />
                <Tooltip
                  formatter={(v: number) => [`AED ${v.toFixed(2)}`, 'Per box']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="price" stroke="#277f52" strokeWidth={2.5} fill="url(#heroTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Floating profit card */}
      <div className="absolute -bottom-6 -left-2 w-[240px] animate-float rounded-2xl border border-border/80 bg-card p-4 shadow-lift sm:-left-8 sm:w-[264px]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Est. gross profit</p>
            <p className="font-mono text-[15px] font-semibold text-brand-700 dark:text-brand-300">AED 12,840</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Landed / box</span><span className="font-mono font-medium">AED 29.66</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dubai sell / box</span><span className="font-mono font-medium">AED 42.50</span></div>
          <div className="flex justify-between border-t border-dashed border-border pt-1.5"><span className="font-semibold">Margin</span><span className="font-bold text-brand-600 dark:text-brand-400">30.2%</span></div>
        </div>
      </div>

      {/* Floating route chip */}
      <div className="absolute -right-2 -top-5 hidden items-center gap-2 rounded-full border border-border/80 bg-card py-2 pl-3 pr-4 shadow-lift animate-float [animation-delay:1.2s] sm:flex lg:-right-4">
        <Ship className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <span className="text-xs font-bold">JNPA, Mumbai → Jebel Ali, Dubai</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-800 dark:bg-brand-900 dark:text-brand-200">4–5 days</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Rates ticker */

function RatesTicker() {
  const items = [...SAMPLE_RATES, ...SAMPLE_RATES];
  return (
    <section aria-label="Sample Dubai rates ticker" className="surface-forest overflow-hidden py-3.5">
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {items.map((r, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-[13px] font-semibold text-brand-50">
            <span className="text-brand-200/80">{r.product}</span>
            <span className="font-mono">AED {r.price.toFixed(2)}</span>
            <span className={cn('inline-flex items-center gap-0.5 font-bold', r.change >= 0 ? 'text-lime-300' : 'text-red-300')}>
              {r.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(r.change)}%
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Features */

const FEATURES = [
  {
    icon: LineChart,
    title: 'Live Dubai rates (AED)',
    desc: 'Publisher-verified Dubai wholesale prices for pomegranate, green chilli, banana and 40+ products — with variety, grade, packing unit and last-updated time on every rate.',
    span: 'sm:col-span-2',
    accent: true,
  },
  {
    icon: Calculator,
    title: 'Export cost engine',
    desc: 'Product, packing, inland transport, CHA, ocean freight, insurance, duties and commission — converted INR → AED automatically.',
  },
  {
    icon: Wallet,
    title: 'Profit per box, kg & tonne',
    desc: 'See landed cost and margin at every level before you commit to a shipment.',
  },
  {
    icon: FileText,
    title: 'PDF quotations',
    desc: 'Share clean, professional cost sheets with buyers in one click. Snapshots never change silently.',
  },
  {
    icon: History,
    title: 'Price history & trends',
    desc: 'Track how Dubai prices moved over days and weeks to time your dispatch better.',
  },
  {
    icon: Ship,
    title: 'Ports, routes & freight',
    desc: 'JNPA, Mundra, Chennai → Jebel Ali. Route transit times and freight quotes built into your costing.',
    span: 'sm:col-span-2',
  },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Why FreshmCalc</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Everything an exporter needs, <span className="text-gradient">in one green dashboard</span></h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            Stop juggling WhatsApp rates and Excel sheets. One platform from Indian sourcing price to Dubai profit.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80} className={cn(f.span)}>
              <article
                className={cn(
                  'group h-full rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7',
                  f.accent
                    ? 'surface-forest border-transparent text-white'
                    : 'border-border/80 bg-card shadow-soft hover:border-brand-300 dark:hover:border-brand-700'
                )}
              >
                <span
                  className={cn(
                    'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110',
                    f.accent ? 'bg-lime-400 text-brand-950' : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                  )}
                >
                  <f.icon className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className={cn('mt-2 text-sm leading-relaxed', f.accent ? 'text-brand-100/85' : 'text-muted-foreground')}>{f.desc}</p>
                {f.accent && (
                  <Link to="/#live-rates" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-lime-300 hover:gap-2 transition-all">
                    See sample rates <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Live rates demo */

function LiveRatesPreview() {
  return (
    <section id="live-rates" className="scroll-mt-24 border-y border-border/60 bg-brand-50/60 py-16 dark:bg-brand-950/30 sm:py-20 lg:py-24">
      <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <Reveal>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Dubai market rates</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Today's Dubai prices, <span className="text-gradient">not yesterday's mandi bhav</span></h2>
          <p className="mt-4 leading-relaxed text-muted-foreground sm:text-lg">
            Every rate is a Dubai, UAE wholesale price in AED — published by our market team with the source and
            timestamp shown. Indian domestic prices are never passed off as Dubai rates.
          </p>
          <ul className="mt-6 space-y-3 text-[15px]">
            {[
              'Variety, grade & packing clearly mentioned',
              'Freshness timer on every rate — know how old a price is',
              'Day-change % so you can spot rising markets early',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/register">Unlock full rates <ArrowRight className="h-[18px] w-[18px]" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/pricing">Compare plans</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Preview below uses sample data. Live rates are available to subscribers.</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lift">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
              <div>
                <h3 className="font-display text-base font-bold">Dubai Wholesale · Today</h3>
                <p className="text-xs text-muted-foreground">Al Aweer Central Market · All prices AED</p>
              </div>
              <Badge variant="warn" className="normal-case tracking-normal">Sample data</Badge>
            </div>
            <ul className="divide-y divide-border/60">
              {SAMPLE_RATES.map((r) => (
                <li key={r.product} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/70 dark:hover:bg-brand-950/50 sm:px-5">
                  <ProductAvatar name={r.product} className="hidden min-[420px]:flex" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{r.product}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.variety} · {r.updatedMins} min ago</p>
                  </div>
                  <span
                    className={cn(
                      'hidden items-center gap-1 rounded-full px-2 py-1 text-xs font-bold sm:inline-flex',
                      r.change >= 0
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300'
                    )}
                  >
                    {r.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {r.change >= 0 ? '+' : ''}{r.change}%
                  </span>
                  <div className="w-[118px] shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold">AED {r.price.toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground">{r.unit}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/70 bg-muted/40 px-5 py-3.5 text-center">
              <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition-all hover:gap-2.5 dark:text-brand-300">
                See all 40+ products with full history <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ How it works */

const STEPS = [
  { icon: IndianRupee, title: 'Enter India costs', desc: 'Sourcing price, packing centre, boxes and weights — in INR, the way you buy.' },
  { icon: Ship, title: 'Add route & freight', desc: 'Pick origin port and container. Freight, CHA, insurance and duties flow in.' },
  { icon: Globe2, title: 'Compare with Dubai AED', desc: 'Live Dubai selling price vs your landed cost — converted at your FX rate.' },
  { icon: FileText, title: 'Quote with confidence', desc: 'Save the cost sheet, export a PDF quotation and ship with a known margin.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">How it works</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">From Nashik mandi to Jebel Ali in <span className="text-gradient">4 simple steps</span></h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-brand-300/60 dark:border-brand-700/50 lg:block" />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 110} className="relative text-center lg:text-left">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow lg:mx-0">
                <s.icon className="h-7 w-7" strokeWidth={1.8} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 font-display text-xs font-extrabold text-brand-950 ring-4 ring-background">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mx-auto mt-1.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground lg:mx-0">{s.desc}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/register">Try the calculator <ArrowRight className="h-[18px] w-[18px]" /></Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Image band */

function CorridorBand() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <Reveal className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] shadow-lift">
        <img
          src="/images/fresh-export.jpg"
          alt="Crates of fresh pomegranates, chillies and bananas ready for export at a container port"
          className="h-[420px] w-full object-cover sm:h-[460px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/45 to-brand-950/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <h2 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-4xl">
            Built for the India → Dubai fresh produce corridor
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100/90 sm:text-base">
            Reefer containers, 4–5 day sea transit, daily Dubai auctions. FreshmCalc is purpose-built for how
            Indian fruits & vegetables actually reach Gulf markets.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {['JNPA · Nhava Sheva', 'Mundra', 'Chennai', 'Cochin', '→ Jebel Ali, Dubai'].map((p) => (
              <span key={p} className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/25 backdrop-blur">
                {p}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------ Testimonials */

const TESTIMONIALS = [
  {
    quote: 'Earlier we guessed Dubai prices from WhatsApp forwards. Now I check AED rates in the morning and only dispatch when the margin is clear. Two loss-making shipments avoided last season itself.',
    name: 'ravindra Patil',
    role: 'Pomegranate exporter · Solapur',
    initials: 'SP',
  },
  {
    quote: 'The cost sheet is exactly how buyers in Dubai ask for it — per box, per kg, everything in AED. I send the PDF quotation directly from FreshmCalc. Very professional.',
    name: 'Mohammed Farooq',
    role: 'Vegetable trading · Nashik',
    initials: 'MF',
  },
  {
    quote: 'On mobile it works like an app. At the packing house I update boxes and freight, and profit updates instantly. My whole team uses it during dispatch.',
    name: 'Anita Deshmukh',
    role: 'Fresh produce wholesaler · Pune',
    initials: 'AD',
  },
];

function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Trader stories</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Exporters who ship with <span className="text-gradient">numbers, not guesswork</span></h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-3xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <Quote className="h-7 w-7 text-brand-300 dark:text-brand-700" />
                <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-sm font-extrabold text-white">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Pricing teaser */

function PricingTeaser() {
  return (
    <section className="border-y border-border/60 bg-brand-50/60 py-16 dark:bg-brand-950/30 sm:py-20">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Simple pricing</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Less than the cost of <span className="text-gradient">one rejected box</span></h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">Every plan includes live Dubai rates, the full export calculator and PDF quotations.</p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {FALLBACK_PLANS.map((plan, i) => {
            const popular = plan.name === 'Quarterly';
            const months = plan.billingCycle === 'MONTHLY' ? 1 : plan.billingCycle === 'QUARTERLY' ? 3 : 12;
            return (
              <Reveal key={plan.id} delay={i * 100}>
                <article
                  className={cn(
                    'relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1',
                    popular
                      ? 'surface-forest text-white shadow-glow ring-1 ring-brand-400/40'
                      : 'border border-border/80 bg-card shadow-soft hover:shadow-lift'
                  )}
                >
                  {popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-lime-400 text-brand-950">Most popular</Badge>}
                  <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                  <p className="mt-3">
                    <span className="font-display text-4xl font-extrabold">{formatPaise(plan.priceAmount)}</span>
                    <span className={cn('text-sm', popular ? 'text-brand-200/80' : 'text-muted-foreground')}>
                      {' '}/ {months === 1 ? 'month' : `${months} months`}
                    </span>
                  </p>
                  <p className={cn('mt-1 text-xs font-semibold', popular ? 'text-lime-300' : 'text-brand-600 dark:text-brand-400')}>
                    ≈ {formatPaise(Math.round(plan.priceAmount / months))} / month
                  </p>
                  <Button asChild variant={popular ? 'lime' : 'default'} className="mt-6 w-full">
                    <Link to="/pricing">Choose {plan.name}</Link>
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-8 text-center">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition-all hover:gap-2.5 dark:text-brand-300">
            Compare all features <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- FAQ */

const FAQS = [
  {
    q: 'Are these Dubai prices or Indian mandi prices?',
    a: 'All selling prices on FreshmCalc are Dubai, UAE wholesale market rates in AED — published by our market team with source and timestamp. India is treated only as the sourcing/origin market in costing. We never present Indian domestic prices as Dubai rates.',
  },
  {
    q: 'Which products are covered?',
    a: 'Pomegranate, green chilli, banana, mango, grapes, onion, okra, drumstick and 40+ fruits & vegetables commonly exported from India to the Gulf, each with variety, grade and packing details.',
  },
  {
    q: 'How does the export calculator work?',
    a: 'Enter your India-side costs in INR (product, packing, transport), choose the route and container, add freight/CHA/duties, and set the expected Dubai selling price in AED. FreshmCalc returns landed cost per box/kg/tonne, expected revenue, gross profit and margin — saved as a permanent cost sheet you can export as PDF.',
  },
  {
    q: 'Can I use FreshmCalc on my phone at the packing house?',
    a: 'Yes. The app is fully responsive — phone, tablet and desktop. On mobile you get an app-style bottom navigation with the calculator one tap away, designed for quick entries during dispatch.',
  },
  {
    q: 'How do payments and subscriptions work?',
    a: 'Plans are billed in INR via Razorpay (UPI, cards, net-banking). Choose Monthly (₹499), Quarterly (₹1,299) or Yearly (₹4,999). Your access activates instantly after payment and you can manage everything from Subscription & Billing.',
  },
  {
    q: 'Do my old cost sheets change when rates change?',
    a: 'No. Every saved calculation is an immutable snapshot with its own reference number, FX rate and assumptions — so a quotation you sent last month always shows the same numbers.',
  },
];

function Faq() {
  const [open, setOpen] = React.useState<number>(0);
  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Questions, answered</h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            Anything else on your mind? Write to us at{' '}
            <a href="mailto:support@freshmcalc.com" className="font-bold text-brand-700 underline-offset-4 hover:underline dark:text-brand-300">
              support@freshmcalc.com
            </a>{' '}
            — we reply within one business day.
          </p>
          <div className="relative mt-8 hidden overflow-hidden rounded-3xl lg:block">
            <img src="/images/Dubai-market.jpg" alt="Dubai wholesale fresh produce market" className="h-64 w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 text-sm font-bold text-white">Al Aweer Central Market, Dubai — where your produce is priced daily.</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className={cn('overflow-hidden rounded-2xl border bg-card transition-all', isOpen ? 'border-brand-300 shadow-soft dark:border-brand-700' : 'border-border/80')}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-[15px] font-bold sm:text-base">{f.q}</span>
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300', isOpen ? 'rotate-180 bg-brand-600 text-white' : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300')}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={cn('grid transition-all duration-300', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- CTA */

function CtaBand() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <Reveal className="surface-forest relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white shadow-lift sm:px-10 sm:py-16">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(600px_300px_at_center,black,transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Your next container can leave with a <span className="text-lime-300">known profit.</span>
          </h2>
          <p className="mt-4 text-brand-100/85 sm:text-lg">
            Join traders and exporters who check Dubai AED rates and lock their costing before dispatch.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="lime" size="lg" className="w-full sm:w-auto">
              <Link to="/register">Create free account <ArrowRight className="h-[18px] w-[18px]" /></Link>
            </Button>
            <Button asChild size="lg" className="w-full border border-white/25 bg-white/10 text-white shadow-none backdrop-blur hover:bg-white/20 sm:w-auto">
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs font-semibold text-brand-200/70">No card needed to register · Plans from ₹499/month · Cancel anytime</p>
        </div>
      </Reveal>
    </section>
  );
}
