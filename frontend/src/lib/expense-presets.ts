/**
 * Default India → Dubai export cost heads.
 *
 * These are editable starting points, NOT official rates. They follow a
 * typical reefer consignment out of JNPA / Nhava Sheva into Jebel Ali and are
 * meant to be replaced with the user's own quotations. Keeping them in one
 * file also makes them easy to move behind an admin-managed
 * `expense_templates` API later (the database table already exists).
 */
import type { CostLine } from './export-calc';

export const DEFAULT_COST_LINES: CostLine[] = [
  {
    id: 'packing',
    name: 'Packing material & labour',
    category: 'PACKING',
    group: 'ORIGIN',
    mode: 'amount',
    basis: 'box',
    currency: 'INR',
    amount: 55,
    enabled: true,
    note: 'Cartons, liners, labels, grading and packing labour.',
  },
  {
    id: 'inland',
    name: 'Inland transport (packhouse → port)',
    category: 'INLAND_TRANSPORT',
    group: 'ORIGIN',
    mode: 'amount',
    basis: 'shipment',
    currency: 'INR',
    amount: 22000,
    enabled: true,
    note: 'One reefer truck, loading and unloading included.',
  },
  {
    id: 'origin_port',
    name: 'Port handling & THC (origin)',
    category: 'PORT_HANDLING',
    group: 'ORIGIN',
    mode: 'amount',
    basis: 'shipment',
    currency: 'INR',
    amount: 14500,
    enabled: true,
    note: 'Terminal handling, lift-on/lift-off and port charges.',
  },
  {
    id: 'cha',
    name: 'Customs clearance & CHA (India)',
    category: 'CHA',
    group: 'ORIGIN',
    mode: 'amount',
    basis: 'shipment',
    currency: 'INR',
    amount: 9000,
    enabled: true,
    note: 'Shipping bill, CHA fee, documentation and inspection.',
  },
  {
    id: 'ocean_freight',
    name: 'Ocean freight (reefer)',
    category: 'OCEAN_FREIGHT',
    group: 'FREIGHT',
    mode: 'amount',
    basis: 'shipment',
    currency: 'INR',
    amount: 125000,
    enabled: true,
    note: 'One 40ft reefer, Nhava Sheva → Jebel Ali.',
  },
  {
    id: 'insurance',
    name: 'Marine cargo insurance',
    category: 'INSURANCE',
    group: 'FREIGHT',
    mode: 'percent',
    percent: 0.35,
    percentBase: 'purchase',
    enabled: true,
    note: 'Typically 0.3–0.5% of cargo value.',
  },
  {
    id: 'destination_handling',
    name: 'Dubai clearing & handling',
    category: 'DESTINATION_HANDLING',
    group: 'DESTINATION',
    mode: 'amount',
    basis: 'shipment',
    currency: 'AED',
    amount: 850,
    enabled: true,
    note: 'Jebel Ali terminal, Dubai broker, delivery to market.',
  },
  {
    id: 'market_commission',
    name: 'Dubai market commission (mandi)',
    category: 'COMMISSION',
    group: 'COMMISSION_TAX',
    mode: 'percent',
    percent: 5,
    percentBase: 'revenue',
    enabled: true,
    note: 'Paid to the Al Aweer commission agent on sale value.',
  },
  {
    id: 'bank_charges',
    name: 'Bank & remittance charges',
    category: 'BANK_CHARGES',
    group: 'COMMISSION_TAX',
    mode: 'amount',
    basis: 'shipment',
    currency: 'AED',
    amount: 250,
    enabled: true,
    note: 'Document collection, SWIFT and FX margin.',
  },
  {
    id: 'customs_duty',
    name: 'UAE customs duty (if applicable)',
    category: 'TAX',
    group: 'COMMISSION_TAX',
    mode: 'percent',
    percent: 5,
    percentBase: 'purchase',
    enabled: false,
    note: 'Fresh produce is often exempt — enable only if your HS code attracts 5%.',
  },
];

export function defaultCostLines(): CostLine[] {
  return DEFAULT_COST_LINES.map((line) => ({ ...line }));
}

/** Handy examples for the empty state / quick presets. */
export const PRODUCT_PRESETS = [
  { product: 'Pomegranate', variety: 'Wonderful', grade: 'Grade A', costPerBox: 450, sellPerBox: 42.5, kgPerBox: 5 },
  { product: 'Green Chilli', variety: 'G4', grade: 'Export grade', costPerBox: 180, sellPerBox: 18.75, kgPerBox: 4 },
  { product: 'Banana', variety: 'Robusta', grade: 'Premium', costPerBox: 320, sellPerBox: 31, kgPerBox: 13 },
  { product: 'Mango', variety: 'Alphonso', grade: 'Premium', costPerBox: 1100, sellPerBox: 96, kgPerBox: 3.5 },
  { product: 'Grapes', variety: 'Thompson Seedless', grade: 'Export grade', costPerBox: 380, sellPerBox: 38.25, kgPerBox: 4.5 },
  { product: 'Onion', variety: 'Red 55mm+', grade: 'Grade A', costPerBox: 475, sellPerBox: 55, kgPerBox: 25 },
];
