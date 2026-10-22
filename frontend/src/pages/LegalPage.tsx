'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const UPDATED = '22 October 2026';
const CONTACT = 'support@freshmcalc.com';

interface Section {
  heading: string;
  body: React.ReactNode;
}

const PRIVACY: Section[] = [
  {
    heading: '1. Who we are',
    body: (
      <>
        FreshmCalc ("we", "us") provides fresh-produce import/export costing tools and Dubai wholesale market rates for
        traders and CHA-registered exporters. We act as the data fiduciary for the account data described below, under
        India's Digital Personal Data Protection Act, 2023.
      </>
    ),
  },
  {
    heading: '2. What we collect',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li><strong>Account data</strong> — name, email, phone, company, city and country that you enter at signup or in Settings.</li>
        <li><strong>Business data</strong> — product, quantity, costs and rates you type into the calculator, plus any cost sheet you choose to save.</li>
        <li><strong>Billing data</strong> — plan, order ID and payment status. Card/UPI details are entered on Razorpay's hosted checkout; we never see or store them.</li>
        <li><strong>Technical data</strong> — sign-in timestamps and error logs needed to keep the service secure.</li>
      </ul>
    ),
  },
  {
    heading: '3. Why we use it',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>To run the calculator, store your sheets and show live Dubai rates.</li>
        <li>To take subscription payments and reconcile renewals and refunds.</li>
        <li>To send password-reset and billing emails — never marketing unless you opt in.</li>
        <li>To detect abuse and meet tax and accounting obligations.</li>
      </ul>
    ),
  },
  {
    heading: '4. Who we share it with',
    body: (
      <>
        Only service providers who help us run FreshmCalc: Razorpay (payments), our email provider (password resets and
        receipts) and our hosting provider (servers in India and the EU). We do not sell your data and we do not share
        your cost sheets with other traders.
      </>
    ),
  },
  {
    heading: '5. How long we keep it',
    body: (
      <>
        Account and saved-sheet data stays while your account is active. Deleting your account from Settings wipes your
        profile, cost sheets and active plan immediately. Payment records are retained for statutory accounting (8
        years) in an anonymised form. Server logs roll off after 30 days.
      </>
    ),
  },
  {
    heading: '6. Your rights',
    body: (
      <>
        You can view and correct your profile in Settings, export a cost sheet as PDF at any time, and delete your
        account in one step. For a machine-readable copy of your data or any other request, write to {CONTACT} — we
        respond within 30 days. You can also complain to the Data Protection Board of India.
      </>
    ),
  },
  {
    heading: '7. Security',
    body: (
      <>
        Passwords are stored as bcrypt hashes, traffic is served over HTTPS, payment webhooks are signature-verified,
        and database access is restricted to the application network. No system is perfectly secure: use a unique
        password and tell us at once if you suspect unauthorised access.
      </>
    ),
  },
  {
    heading: '8. Children',
    body: <>FreshmCalc is a business tool for people aged 18 and over. We do not knowingly collect data from children.</>,
  },
  {
    heading: '9. Changes',
    body: (
      <>
        We will email you about material changes before they take effect. The date at the top of this page shows the
        current version.
      </>
    ),
  },
];

const TERMS: Section[] = [
  {
    heading: '1. The service',
    body: (
      <>
        FreshmCalc provides Dubai wholesale price indications and an India → Dubai export costing calculator. It is a
        planning tool. Rates, duties and freight change daily; you remain responsible for verifying them with your CHA
        before filing a shipping bill or quoting a customer.
      </>
    ),
  },
  {
    heading: '2. Your account',
    body: (
      <>
        Keep your login confidential and your profile details accurate. One human per account — sharing credentials
        between staff is not allowed; contact us for multi-seat plans. You must be 18+ and authorised to act for the
        business you register.
      </>
    ),
  },
  {
    heading: '3. Plans, billing and renewals',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Plans are billed in Indian Rupees through Razorpay, monthly or annually as shown at checkout.</li>
        <li>Subscriptions renew automatically until cancelled. Cancel any time from Subscription & Billing; access continues to the end of the paid period.</li>
        <li>Prices may change with 30 days' notice. Existing paid periods are never repriced mid-term.</li>
        <li>Failed renewals are retried; features lock after the grace period until payment succeeds.</li>
      </ul>
    ),
  },
  {
    heading: '4. Refunds',
    body: (
      <>
        First-time purchases can be refunded within 7 days if you have not exported a PDF or saved a cost sheet.
        Duplicate charges are refunded in full. Refunds go back to the original payment method within 5–7 working days
        via Razorpay. Email {CONTACT} with your order ID.
      </>
    ),
  },
  {
    heading: '5. Acceptable use',
    body: (
      <>
        Do not scrape or redistribute market rates, resell access, attempt to bypass plan limits, upload unlawful
        content or interfere with the service. We may suspend accounts that do, with notice where practical.
      </>
    ),
  },
  {
    heading: '6. Accuracy and limitation of liability',
    body: (
      <>
        Rates are indicative wholesale observations in AED, not offers to sell. The calculator applies the cost lines
        and exchange rate you enter; rounding and duty treatment are your responsibility. To the maximum extent
        permitted by law, our total liability for any claim is limited to the fees you paid us in the previous three
        months. We are not liable for lost profit, demurrage, customs penalties or rejected consignments.
      </>
    ),
  },
  {
    heading: '7. Your content',
    body: (
      <>
        You keep ownership of the products, costs and sheets you enter. You grant us the limited licence needed to
        store and display them back to you and to produce your PDFs.
      </>
    ),
  },
  {
    heading: '8. Suspension and termination',
    body: (
      <>
        You can delete your account at any time from Settings. We may terminate for material breach, non-payment or
        legal requirement. On termination we delete your business data as described in the privacy policy.
      </>
    ),
  },
  {
    heading: '9. Governing law',
    body: (
      <>
        These terms are governed by the laws of India. Courts at Pune, Maharashtra have exclusive jurisdiction, subject
        to any mandatory consumer protection rules in your state.
      </>
    ),
  },
];

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy';
  const sections = isPrivacy ? PRIVACY : TERMS;

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 sm:flex">
          {isPrivacy ? <ShieldCheck className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {isPrivacy ? 'Privacy policy' : 'Terms of service'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {UPDATED} · Applies to freshmcalc.com and the FreshmCalc mobile apps.</p>
        </div>
      </div>

      {isPrivacy && (
        <div className="mt-6 rounded-2xl border border-brand-200/70 bg-brand-50/70 p-4 text-sm leading-relaxed text-brand-900 dark:border-brand-800/60 dark:bg-brand-950/50 dark:text-brand-100">
          <strong className="font-bold">Short version:</strong> we store the profile and cost sheets you give us, take
          payments through Razorpay (we never see your card), and delete everything when you tap{' '}
          <Link to="/settings" className="font-bold underline underline-offset-4">Delete account</Link>.
        </div>
      )}

      <Card className="mt-6">
        <CardContent className="space-y-7 px-5 py-7 sm:px-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-[17px] font-bold tracking-tight">{section.heading}</h2>
              <div className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{section.body}</div>
            </section>
          ))}

          <section className="rounded-2xl bg-muted/60 p-4">
            <h2 className="font-display text-[17px] font-bold tracking-tight">Contact</h2>
            <p className="mt-2 flex items-center gap-2 text-[14.5px] text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <a href={`mailto:${CONTACT}`} className="font-semibold text-foreground underline underline-offset-4">
                {CONTACT}
              </a>
            </p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">Grievance officer: reply within 30 days. Support hours Mon–Sat, 9:00–19:00 IST.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
