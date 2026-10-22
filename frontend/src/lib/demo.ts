/**
 * Demo mode — lets anyone explore the full app UI with clearly-labelled
 * sample data, without a running backend (e.g. for client previews).
 *
 * Activated only from the "Explore live demo" buttons; a persistent banner
 * inside the app shows that sample data is in use. Real accounts and the
 * production API are completely unaffected.
 */
import { FALLBACK_PLANS } from './sample-data';

const DEMO_FLAG = 'freshmcalc_demo';
const DEMO_CALCS_KEY = 'freshmcalc_demo_calcs';

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_FLAG) === '1';
  } catch {
    return false;
  }
}

export function demoUser(role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') {
  const in60Days = new Date(Date.now() + 60 * 86_400_000).toISOString();
  const in30DaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  return {
    email: 'demo@freshmcalc.com',
    role,
    status: 'ACTIVE',
    firstName: 'Demo',
    lastName: 'Trader',
    phone: '+91 98220 00000',
    company: 'GreenValley Exports',
    country: 'India',
    city: 'Nashik',
    planEntitlements: {
      dubaiRatesAccess: true,
      calculatorAccess: true,
      pdfExportAccess: true,
      savedCalculationsAccess: true,
    },
    activeSubscription: {
      planName: 'Quarterly',
      active: true,
      status: 'ACTIVE',
      currentPeriodStart: in30DaysAgo,
      currentPeriodEnd: in60Days,
      amountPaid: 129900,
    },
  };
}

export function enableDemo(role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') {
  localStorage.setItem(DEMO_FLAG, '1');
  localStorage.setItem('freshmcalc_token', 'demo-token');
  localStorage.setItem('freshmcalc_user', JSON.stringify(demoUser(role)));
}

export function setDemoRole(role: 'CUSTOMER' | 'ADMIN') {
  localStorage.setItem('freshmcalc_user', JSON.stringify(demoUser(role)));
}

/* ------------------------------------------------------------------ data */

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const DEMO_RATES = [
  { productName: 'Pomegranate', variety: 'Wonderful', grade: 'Grade A', priceAmount: 42.5, pricingUnit: 'per box', packagingDetails: '5 kg export carton', updated: 18 },
  { productName: 'Pomegranate', variety: 'Bhagwa', grade: 'Grade A', priceAmount: 39.75, pricingUnit: 'per box', packagingDetails: '5 kg export carton', updated: 65 },
  { productName: 'Green Chilli', variety: 'G4', grade: 'Export grade', priceAmount: 18.75, pricingUnit: 'per box', packagingDetails: '4 kg carton', updated: 24 },
  { productName: 'Banana', variety: 'Robusta', grade: 'Premium', priceAmount: 31, pricingUnit: 'per carton', packagingDetails: '13 kg carton', updated: 31 },
  { productName: 'Mango', variety: 'Alphonso', grade: 'Premium', priceAmount: 96, pricingUnit: 'per box', packagingDetails: '3.5 kg gift box', updated: 42 },
  { productName: 'Mango', variety: 'Kesar', grade: 'Grade A', priceAmount: 54, pricingUnit: 'per box', packagingDetails: '4 kg carton', updated: 130 },
  { productName: 'Onion', variety: 'Red', grade: '55mm+', priceAmount: 2.4, pricingUnit: 'per kg', packagingDetails: '25 kg mesh bag', updated: 55 },
  { productName: 'Grapes', variety: 'Thompson Seedless', grade: 'Export grade', priceAmount: 38.25, pricingUnit: 'per box', packagingDetails: '4.5 kg punnet box', updated: 63 },
  { productName: 'Okra', variety: 'Tender', grade: 'Export pack', priceAmount: 16.5, pricingUnit: 'per box', packagingDetails: '4 kg carton', updated: 78 },
  { productName: 'Drumstick', variety: 'PKM-1', grade: 'Long', priceAmount: 22, pricingUnit: 'per box', packagingDetails: '5 kg carton', updated: 96 },
  { productName: 'Curry Leaves', variety: 'Fresh bunch', grade: 'Export grade', priceAmount: 14, pricingUnit: 'per box', packagingDetails: '2 kg ventilated box', updated: 150 },
  { productName: 'Bitter Gourd', variety: 'Palee', grade: 'Grade A', priceAmount: 15.25, pricingUnit: 'per box', packagingDetails: '4 kg carton', updated: 320 },
].map((r, i) => ({
  id: i + 1,
  productName: r.productName,
  variety: r.variety,
  grade: r.grade,
  marketName: 'Al Aweer Wholesale Market',
  country: 'UAE',
  city: 'Dubai',
  priceAmount: r.priceAmount,
  currency: 'AED',
  pricingUnit: r.pricingUnit,
  packagingDetails: r.packagingDetails,
  originCountry: 'India',
  effectiveDateTime: minsAgo(r.updated),
  lastUpdated: minsAgo(r.updated),
  dataSource: 'ADMIN',
  sourceReference: 'demo-sample',
  automaticallyFetched: false,
  status: 'PUBLISHED',
}));

const DEMO_PRODUCTS = [
  { id: 1, name: 'Pomegranate', category: 'FRUIT', status: 'ACTIVE' },
  { id: 2, name: 'Green Chilli', category: 'VEGETABLE', status: 'ACTIVE' },
  { id: 3, name: 'Banana', category: 'FRUIT', status: 'ACTIVE' },
  { id: 4, name: 'Mango', category: 'FRUIT', status: 'ACTIVE' },
  { id: 5, name: 'Onion', category: 'VEGETABLE', status: 'ACTIVE' },
  { id: 6, name: 'Grapes', category: 'FRUIT', status: 'ACTIVE' },
  { id: 7, name: 'Okra', category: 'VEGETABLE', status: 'ACTIVE' },
  { id: 8, name: 'Drumstick', category: 'VEGETABLE', status: 'ACTIVE' },
];

const DEMO_VARIETIES = [
  { id: 1, productId: 1, productName: 'Pomegranate', variety: 'Wonderful', grade: 'Grade A', defaultPackagingUnit: 'per box', status: 'ACTIVE' },
  { id: 2, productId: 1, productName: 'Pomegranate', variety: 'Bhagwa', grade: 'Grade A', defaultPackagingUnit: 'per box', status: 'ACTIVE' },
  { id: 3, productId: 2, productName: 'Green Chilli', variety: 'G4', grade: 'Export grade', defaultPackagingUnit: 'per box', status: 'ACTIVE' },
  { id: 4, productId: 3, productName: 'Banana', variety: 'Robusta', grade: 'Premium', defaultPackagingUnit: 'per carton', status: 'ACTIVE' },
  { id: 5, productId: 4, productName: 'Mango', variety: 'Alphonso', grade: 'Premium', defaultPackagingUnit: 'per box', status: 'ACTIVE' },
  { id: 6, productId: 5, productName: 'Onion', variety: 'Red', grade: '55mm+', defaultPackagingUnit: 'per kg', status: 'ACTIVE' },
  { id: 7, productId: 6, productName: 'Grapes', variety: 'Thompson Seedless', grade: 'Export grade', defaultPackagingUnit: 'per box', status: 'ACTIVE' },
];

const DEMO_PORTS = [
  { id: 1, name: 'JNPA / Nhava Sheva', unlocode: 'INNSA', portType: 'SEA', countryName: 'India', cityName: 'Mumbai', supportsContainer: true, supportsReefer: true, active: true },
  { id: 2, name: 'Mundra Port', unlocode: 'INMUN', portType: 'SEA', countryName: 'India', cityName: 'Mundra', supportsContainer: true, supportsReefer: true, active: true },
  { id: 3, name: 'Chennai Port', unlocode: 'INMAA', portType: 'SEA', countryName: 'India', cityName: 'Chennai', supportsContainer: true, supportsReefer: true, active: true },
  { id: 4, name: 'Jebel Ali Port, Dubai', unlocode: 'AEJEA', portType: 'SEA', countryName: 'UAE', cityName: 'Dubai', supportsContainer: true, supportsReefer: true, active: true },
];

const DEMO_ROUTES = [
  { id: 1, originPortId: 1, originPortName: 'JNPA / Nhava Sheva', destinationPortId: 4, destinationPortName: 'Jebel Ali Port, Dubai', transitTimeDays: 5, operational: true, transshipmentRequired: false },
  { id: 2, originPortId: 2, originPortName: 'Mundra Port', destinationPortId: 4, destinationPortName: 'Jebel Ali Port, Dubai', transitTimeDays: 4, operational: true, transshipmentRequired: false },
  { id: 3, originPortId: 3, originPortName: 'Chennai Port', destinationPortId: 4, destinationPortName: 'Jebel Ali Port, Dubai', transitTimeDays: 8, operational: true, transshipmentRequired: true },
];

const DEMO_QUOTES = [
  { id: 1, routeId: 1, containerType: 'REEFER', amount: 1850, currency: 'USD', source: 'Demo sample quote' },
  { id: 2, routeId: 2, containerType: 'REEFER', amount: 1720, currency: 'USD', source: 'Demo sample quote' },
  { id: 3, routeId: 1, containerType: '40HC', amount: 1350, currency: 'USD', source: 'Demo sample quote' },
];

function seedCalculations(): any[] {
  return [
    {
      id: 101, referenceNumber: 'FMC-2026-0101', product: 'Pomegranate', variety: 'Wonderful', grade: 'Grade A',
      originPort: 'JNPA / Nhava Sheva', destinationPort: 'Jebel Ali Port, Dubai', containerType: 'REEFER',
      numberOfBoxes: 1000, netWeightKg: 5000, conversionRateInrToAed: 0.044,
      totalLandedCostAed: 24390.4, grossProfitAed: 18109.6, profitMarginPercent: 42.6, expectedRevenueAed: 42500,
      costPerBoxAed: 24.39, costPerKgAed: 4.88, createdAt: minsAgo(60 * 26), status: 'SAVED',
    },
    {
      id: 102, referenceNumber: 'FMC-2026-0098', product: 'Green Chilli', variety: 'G4', grade: 'Export grade',
      originPort: 'Mundra Port', destinationPort: 'Jebel Ali Port, Dubai', containerType: 'REEFER',
      numberOfBoxes: 1400, netWeightKg: 5600, conversionRateInrToAed: 0.044,
      totalLandedCostAed: 13552, grossProfitAed: 12698, profitMarginPercent: 48.4, expectedRevenueAed: 26250,
      costPerBoxAed: 9.68, costPerKgAed: 2.42, createdAt: minsAgo(60 * 72), status: 'SAVED',
    },
    {
      id: 103, referenceNumber: 'FMC-2026-0091', product: 'Banana', variety: 'Robusta', grade: 'Premium',
      originPort: 'JNPA / Nhava Sheva', destinationPort: 'Jebel Ali Port, Dubai', containerType: '40HC',
      numberOfBoxes: 1080, netWeightKg: 14040, conversionRateInrToAed: 0.0438,
      totalLandedCostAed: 24710, grossProfitAed: 8770, profitMarginPercent: 26.2, expectedRevenueAed: 33480,
      costPerBoxAed: 22.88, costPerKgAed: 1.76, createdAt: minsAgo(60 * 140), status: 'SAVED',
    },
  ];
}

function loadCalculations(): any[] {
  try {
    const raw = localStorage.getItem(DEMO_CALCS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seed = seedCalculations();
  try { localStorage.setItem(DEMO_CALCS_KEY, JSON.stringify(seed)); } catch { /* ignore */ }
  return seed;
}

function computeDemoCalculation(body: any) {
  const boxes = Number(body.numberOfBoxes) || 0;
  const netKg = Number(body.netWeightKg) || 0;
  const fx = Number(body.conversionRateInrToAed) || 0.044;
  const items: any[] = Array.isArray(body.items) ? body.items : [];

  const purchaseInr = items.length
    ? items.filter((i) => i.costGroup === 'PURCHASE').reduce((s, i) => s + Number(i.amount || 0), 0)
    : body.productCostUnit === 'per kg'
      ? Number(body.productCostPerUnit) * netKg
      : Number(body.productCostPerUnit) * boxes;

  const groupTotal = (group: string) =>
    items.filter((i) => i.costGroup === group).reduce((s, i) => s + Number(i.amount || 0), 0);

  const totalOriginInr = groupTotal('ORIGIN');
  const totalFreightInr = groupTotal('FREIGHT');
  const totalDestinationInr = groupTotal('DESTINATION');
  const totalCommissionTaxInr = groupTotal('COMMISSION_TAX');

  const totalShipmentInr =
    purchaseInr + totalOriginInr + totalFreightInr + totalDestinationInr + totalCommissionTaxInr;
  const landedAed = totalShipmentInr * fx;
  const revenueAed =
    body.expectedDubaiSellingPriceUnit === 'per kg'
      ? Number(body.expectedDubaiSellingPricePerUnit) * netKg
      : Number(body.expectedDubaiSellingPricePerUnit) * boxes;
  const profit = revenueAed - landedAed;

  return {
    ...body,
    id: Date.now(),
    referenceNumber: `FMC-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    totalPurchaseInr: Number(purchaseInr.toFixed(2)),
    totalOriginInr: Number(totalOriginInr.toFixed(2)),
    totalFreightInr: Number(totalFreightInr.toFixed(2)),
    totalDestinationInr: Number(totalDestinationInr.toFixed(2)),
    totalCommissionTaxInr: Number(totalCommissionTaxInr.toFixed(2)),
    totalShipmentCostInr: Number(totalShipmentInr.toFixed(2)),
    totalLandedCostAed: Number(landedAed.toFixed(2)),
    costPerBoxAed: boxes > 0 ? Number((landedAed / boxes).toFixed(2)) : 0,
    costPerKgAed: netKg > 0 ? Number((landedAed / netKg).toFixed(2)) : 0,
    costPerTonneAed: netKg > 0 ? Number(((landedAed / netKg) * 1000).toFixed(2)) : 0,
    expectedRevenueAed: Number(revenueAed.toFixed(2)),
    grossProfitAed: Number(profit.toFixed(2)),
    profitPerBoxAed: boxes > 0 ? Number((profit / boxes).toFixed(2)) : 0,
    profitMarginPercent: revenueAed > 0 ? Number(((profit / revenueAed) * 100).toFixed(2)) : 0,
    items,
    createdAt: new Date().toISOString(),
    status: 'DRAFT',
  };
}

/* ---------------------------------------------------------------- adapter */

function ok(config: any, data: any, status = 200) {
  return Promise.resolve({ data, status, statusText: 'OK (demo)', headers: {}, config });
}

/** Axios adapter that answers every API route with demo sample data. */
export function demoAdapter(config: any) {
  const url: string = config.url || '';
  const method: string = (config.method || 'get').toLowerCase();
  const body = config.data ? JSON.parse(config.data) : {};

  if (url.includes('/auth/')) {
    return ok(config, { token: 'demo-token', email: body.email || 'demo@freshmcalc.com', role: 'CUSTOMER', status: 'ACTIVE' });
  }
  if (url.includes('/rates') && method === 'get') return ok(config, DEMO_RATES);
  if (url.includes('/rates') && method === 'post' && url.includes('/stale')) return ok(config, { ok: true });
  if (url.includes('/rates') && method === 'post') {
    const variety = DEMO_VARIETIES.find((v) => v.id === Number(body.productVarietyId));
    DEMO_RATES.unshift({
      id: Date.now(),
      productName: variety?.productName || 'Product',
      variety: variety?.variety || '',
      grade: variety?.grade || '',
      marketName: body.marketName || 'Al Aweer Wholesale Market',
      country: body.country || 'UAE', city: body.city || 'Dubai',
      priceAmount: Number(body.priceAmount) || 0, currency: body.currency || 'AED',
      pricingUnit: body.pricingUnit || 'per box', packagingDetails: body.packagingDetails || '',
      originCountry: body.originCountry || 'India',
      effectiveDateTime: new Date().toISOString(), lastUpdated: new Date().toISOString(),
      dataSource: 'ADMIN', sourceReference: body.sourceReference || 'demo',
      automaticallyFetched: false, status: 'PUBLISHED',
    });
    return ok(config, DEMO_RATES[0], 201);
  }
  if (url.includes('/products/varieties') && method === 'get') return ok(config, DEMO_VARIETIES);
  if (url.includes('/products/varieties') && method === 'post') {
    const product = DEMO_PRODUCTS.find((p) => p.id === Number(body.productId));
    const v = { id: Date.now(), productName: product?.name || '', status: 'ACTIVE', ...body };
    DEMO_VARIETIES.push(v);
    return ok(config, v, 201);
  }
  if (url.includes('/products') && method === 'get') return ok(config, DEMO_PRODUCTS);
  if (url.includes('/products') && method === 'post') {
    const p = { id: Date.now(), status: 'ACTIVE', ...body };
    DEMO_PRODUCTS.push(p);
    return ok(config, p, 201);
  }
  if (url.includes('/ports') && method === 'get') return ok(config, DEMO_PORTS);
  if (url.includes('/ports') && method === 'post') {
    const p = { id: Date.now(), countryName: '', cityName: '', active: true, ...body };
    DEMO_PORTS.push(p);
    return ok(config, p, 201);
  }
  if (url.includes('/routes/freight-quotes') && method === 'get') return ok(config, DEMO_QUOTES);
  if (url.includes('/routes/freight-quotes') && method === 'post') {
    const q = { id: Date.now(), ...body };
    DEMO_QUOTES.push(q);
    return ok(config, q, 201);
  }
  if (url.includes('/routes')) return ok(config, DEMO_ROUTES);
  if (url.includes('/subscription-plans/subscription')) return ok(config, demoUser().activeSubscription);
  if (url.includes('/subscription-plans/subscribe')) return ok(config, { ok: true, demo: true });
  if (url.includes('/subscription-plans')) return ok(config, FALLBACK_PLANS);
  if (url.includes('/calculations') && method === 'get') return ok(config, loadCalculations());
  if (url.includes('/calculations') && method === 'post') {
    const calc = computeDemoCalculation(body);
    const all = [calc, ...loadCalculations()];
    try { localStorage.setItem(DEMO_CALCS_KEY, JSON.stringify(all)); } catch { /* ignore */ }
    return ok(config, calc, 201);
  }
  if (url.includes('/calculations') && method === 'delete') return ok(config, { ok: true });
  if (url.includes('/payments')) return ok(config, { ok: true, demo: true });

  return ok(config, []);
}
