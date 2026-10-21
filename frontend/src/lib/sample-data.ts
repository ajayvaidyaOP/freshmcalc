/**
 * Illustrative sample data used ONLY for public marketing previews
 * (landing page ticker / rates preview) and as a pricing fallback when the
 * backend is unreachable. Sample rates are always labelled "Sample preview"
 * in the UI — live subscriber data always comes from the API.
 */

export interface SampleRate {
  product: string;
  variety: string;
  price: number;
  unit: string;
  change: number; // % vs previous day
  updatedMins: number;
}

export const SAMPLE_RATES: SampleRate[] = [
  { product: 'Pomegranate', variety: 'Wonderful · Grade A', price: 42.5, unit: 'per box (5 kg)', change: 3.2, updatedMins: 18 },
  { product: 'Green Chilli', variety: 'G4 · Export grade', price: 18.75, unit: 'per box (4 kg)', change: -1.4, updatedMins: 24 },
  { product: 'Banana', variety: 'Robusta · 13 kg carton', price: 31.0, unit: 'per carton', change: 1.8, updatedMins: 31 },
  { product: 'Mango', variety: 'Alphonso · Premium', price: 96.0, unit: 'per box (3.5 kg)', change: 5.6, updatedMins: 42 },
  { product: 'Onion', variety: 'Red · 55mm+', price: 2.4, unit: 'per kg', change: -0.8, updatedMins: 55 },
  { product: 'Grapes', variety: 'Thompson Seedless', price: 38.25, unit: 'per box (4.5 kg)', change: 2.1, updatedMins: 63 },
  { product: 'Okra (Bhindi)', variety: 'Tender · Export pack', price: 16.5, unit: 'per box (4 kg)', change: 0.9, updatedMins: 78 },
  { product: 'Drumstick (Moringa)', variety: 'PKM-1 · Long', price: 22.0, unit: 'per box (5 kg)', change: -2.2, updatedMins: 96 },
];

/** 7-day sample trend for the hero preview chart (AED per box, pomegranate). */
export const SAMPLE_TREND = [
  { day: 'Thu', price: 38.2 },
  { day: 'Fri', price: 39.6 },
  { day: 'Sat', price: 38.9 },
  { day: 'Sun', price: 40.4 },
  { day: 'Mon', price: 41.1 },
  { day: 'Tue', price: 40.6 },
  { day: 'Wed', price: 42.5 },
];

/** Mirrors the backend seed (V2__reference_data.sql) — prices in paise. */
export const FALLBACK_PLANS = [
  {
    id: 1,
    name: 'Monthly',
    description: 'Perfect for trying FreshmCalc on live shipments.',
    priceAmount: 49900,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    dubaiRatesAccess: true,
    calculatorAccess: true,
    pdfExportAccess: true,
    savedCalculationsAccess: true,
    active: true,
  },
  {
    id: 2,
    name: 'Quarterly',
    description: 'For regular exporters shipping every season.',
    priceAmount: 129900,
    currency: 'INR',
    billingCycle: 'QUARTERLY',
    dubaiRatesAccess: true,
    calculatorAccess: true,
    pdfExportAccess: true,
    savedCalculationsAccess: true,
    active: true,
  },
  {
    id: 3,
    name: 'Yearly',
    description: 'Best value for high-volume trading houses.',
    priceAmount: 499900,
    currency: 'INR',
    billingCycle: 'YEARLY',
    dubaiRatesAccess: true,
    calculatorAccess: true,
    pdfExportAccess: true,
    savedCalculationsAccess: true,
    active: true,
  },
];
