/**
 * FreshmCalc export-costing engine (India → Dubai).
 *
 * One place for every number the app shows, so the live estimate and the
 * saved cost sheet can never disagree. Mirrors the backend formula
 * (CalculationService, FORMULA_VERSION 1.0) and uses the same rounding rules:
 *   • money  → 2 decimals, half-up
 *   • rates  → 6 decimals
 *   • unit costs → 4 decimals
 *
 * Cost heads follow a real container export file:
 *   PURCHASE        goods bought in India (₹ per box or per kg)
 *   ORIGIN          packing, inland transport, port/THC, CHA & documentation
 *   FREIGHT         ocean freight, marine insurance
 *   DESTINATION     Dubai clearance, handling, last-mile
 *   COMMISSION_TAX  mandi commission, customs duty, bank charges
 *
 * Selling price is always a Dubai market price in AED. India is only the
 * sourcing market — Indian domestic prices are never shown as Dubai prices.
 */

export type CostGroup = 'PURCHASE' | 'ORIGIN' | 'FREIGHT' | 'DESTINATION' | 'COMMISSION_TAX';
export type Currency = 'INR' | 'AED';
export type CostBasis = 'shipment' | 'box';
export type PercentBase = 'purchase' | 'freight' | 'revenue';
export type PriceUnit = 'per box' | 'per kg';

export interface CostLine {
  /** Stable id — also used as the React key. */
  id: string;
  name: string;
  /** Backend expense category, e.g. PACKING / CHA / OCEAN_FREIGHT. */
  category: string;
  group: Exclude<CostGroup, 'PURCHASE'>;
  /** `amount` = fixed money; `percent` = % of a base value. */
  mode: 'amount' | 'percent';
  /** Amount mode: is the money per shipment or per box? */
  basis?: CostBasis;
  /** Amount mode: currency the user typed the amount in. */
  currency?: Currency;
  /** Amount mode: the amount itself. */
  amount?: number;
  /** Percent mode: percentage value (5 = 5%). */
  percent?: number;
  /** Percent mode: what the percentage is calculated on. */
  percentBase?: PercentBase;
  enabled: boolean;
  note?: string;
  /** True for user-added lines (can be removed). */
  custom?: boolean;
}

export interface CalcInput {
  boxes: number;
  kgPerBox: number;
  /** Optional measured gross weight. Falls back to net + 6% packaging. */
  grossWeightKg?: number;
  productCost: number;
  productCostUnit: PriceUnit;
  sellingPrice: number;
  sellingPriceUnit: PriceUnit;
  /** 1 INR in AED, e.g. 0.0417. */
  fx: number;
  lines: CostLine[];
}

export interface CostLineResult extends CostLine {
  /** Canonical INR value used for the saved cost sheet. */
  amountInr: number;
  amountAed: number;
}

export interface CalcResult {
  boxes: number;
  netWeightKg: number;
  grossWeightKg: number;
  kgPerBox: number;
  fx: number;

  purchaseInr: number;
  purchaseAed: number;
  purchasePerBoxInr: number;
  purchasePerKgInr: number;

  lines: CostLineResult[];
  groupInr: Record<CostGroup, number>;
  groupAed: Record<CostGroup, number>;

  totalCostInr: number;
  totalCostAed: number;
  costPerBoxAed: number;
  costPerKgAed: number;
  costPerTonneAed: number;

  revenueAed: number;
  revenuePerBoxAed: number;
  revenuePerKgAed: number;

  profitAed: number;
  profitPerBoxAed: number;
  marginPct: number;
  /** Return on the money spent (profit ÷ landed cost). */
  roiPct: number;
  /** Dubai price per box needed to break even (0 at no volume). */
  breakEvenPerBoxAed: number;
  breakEvenPerKgAed: number;
}

export const DEFAULT_FX = 0.0417;

const ZERO_GROUPS: Record<CostGroup, number> = {
  PURCHASE: 0,
  ORIGIN: 0,
  FREIGHT: 0,
  DESTINATION: 0,
  COMMISSION_TAX: 0,
};

const GROUP_ORDER: CostGroup[] = ['PURCHASE', 'ORIGIN', 'FREIGHT', 'DESTINATION', 'COMMISSION_TAX'];

export const GROUP_LABELS: Record<CostGroup, string> = {
  PURCHASE: 'Product purchase',
  ORIGIN: 'India-side costs',
  FREIGHT: 'Freight & insurance',
  DESTINATION: 'Dubai-side costs',
  COMMISSION_TAX: 'Commission & taxes',
};

export const GROUP_HINTS: Record<CostGroup, string> = {
  PURCHASE: 'What you pay the farmer / packing house in India.',
  ORIGIN: 'Packing material, inland trucking, port handling, CHA & export documents.',
  FREIGHT: 'Ocean freight and marine cargo insurance.',
  DESTINATION: 'Jebel Ali handling, Dubai customs broker, last-mile delivery.',
  COMMISSION_TAX: 'Mandi commission, UAE customs duty (if any) and bank charges.',
};

/** Round half-up to `digits` — mirrors BigDecimal.ROUND_HALF_UP on the backend. */
export function round(value: number, digits = 2): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** digits;
  const scaled = Math.abs(value) * f;
  // Small epsilon protects against 1.005 → 1.00 float artefacts.
  const rounded = Math.floor(scaled + 0.5 + 1e-9) / f;
  return value < 0 ? -rounded : rounded;
}

function n(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function groupOf(group: string): Exclude<CostGroup, 'PURCHASE'> {
  return GROUP_ORDER.includes(group as CostGroup) && group !== 'PURCHASE'
    ? (group as Exclude<CostGroup, 'PURCHASE'>)
    : 'ORIGIN';
}

/**
 * Resolve a single cost line to an INR + AED amount.
 * Percent lines are resolved with the bases available at that point in the
 * calculation (purchase → freight subtotal → revenue).
 */
function resolveLine(
  line: CostLine,
  ctx: { fx: number; boxes: number; purchaseInr: number; freightInr: number; revenueAed: number }
): CostLineResult {
  const { fx, boxes, purchaseInr, freightInr, revenueAed } = ctx;
  const safeFx = fx > 0 ? fx : DEFAULT_FX;

  let amountInr: number;
  let amountAed: number;

  if (line.mode === 'percent') {
    const pct = n(line.percent) / 100;
    const base = line.percentBase ?? 'purchase';
    if (base === 'purchase') {
      amountInr = purchaseInr * pct;
      amountAed = amountInr * safeFx;
    } else if (base === 'freight') {
      amountInr = freightInr * pct;
      amountAed = amountInr * safeFx;
    } else {
      amountAed = revenueAed * pct;
      amountInr = amountAed / safeFx;
    }
  } else {
    const value = n(line.amount);
    const quantity = line.basis === 'box' ? boxes : 1;
    if ((line.currency ?? 'INR') === 'AED') {
      amountAed = value * quantity;
      amountInr = amountAed / safeFx;
    } else {
      amountInr = value * quantity;
      amountAed = amountInr * safeFx;
    }
  }

  return {
    ...line,
    group: groupOf(line.group),
    amountInr: round(amountInr, 2),
    amountAed: round(amountAed, 2),
  };
}

/**
 * Calculate a complete export cost sheet.
 * Pure function — same input always gives the same output (safe for tests,
 * offline use and for attaching to a saved snapshot).
 */
export function calculateExport(input: CalcInput): CalcResult {
  const fx = n(input.fx) || DEFAULT_FX;
  const boxes = n(input.boxes);
  const kgPerBox = n(input.kgPerBox);
  const netWeightKg = round(boxes * kgPerBox, 3);
  const grossWeightKg =
    n(input.grossWeightKg) > 0 ? round(n(input.grossWeightKg), 3) : round(netWeightKg * 1.06, 3);

  const productCost = n(input.productCost);
  const purchaseInr =
    input.productCostUnit === 'per kg'
      ? round(productCost * netWeightKg, 2)
      : round(productCost * boxes, 2);
  const purchaseAed = round(purchaseInr * fx, 2);

  const enabled = input.lines.filter((l) => l.enabled);

  // Pass 1 — fixed amounts. Needed so "% of freight" lines see the freight total.
  const fixed = enabled.filter((l) => l.mode !== 'percent');
  const fixedResults = fixed.map((line) =>
    resolveLine(line, { fx, boxes, purchaseInr, freightInr: 0, revenueAed: 0 })
  );
  const freightFixedInr = fixedResults
    .filter((l) => l.group === 'FREIGHT')
    .reduce((sum, l) => sum + l.amountInr, 0);

  // Revenue is independent of costs (it is the Dubai selling price).
  const revenueAed =
    input.sellingPriceUnit === 'per kg'
      ? round(n(input.sellingPrice) * netWeightKg, 2)
      : round(n(input.sellingPrice) * boxes, 2);

  // Pass 2 — percentages, now that purchase, freight and revenue are known.
  const percentResults = enabled
    .filter((l) => l.mode === 'percent')
    .map((line) =>
      resolveLine(line, { fx, boxes, purchaseInr, freightInr: freightFixedInr, revenueAed })
    );

  // Keep the user's original ordering in the breakdown.
  const order = new Map(input.lines.map((l, i) => [l.id, i]));
  const lines = [...fixedResults, ...percentResults].sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );

  const groupInr: Record<CostGroup, number> = { ...ZERO_GROUPS, PURCHASE: purchaseInr };
  for (const line of lines) groupInr[line.group] = round(groupInr[line.group] + line.amountInr, 2);

  const totalCostInr = round(
    GROUP_ORDER.reduce((sum, group) => sum + groupInr[group], 0),
    2
  );
  // Convert once from the canonical INR total so the saved backend value and
  // this live preview always agree.
  const totalCostAed = round(totalCostInr * fx, 2);

  const groupAed = GROUP_ORDER.reduce((acc, group) => {
    acc[group] = round(groupInr[group] * fx, 2);
    return acc;
  }, { ...ZERO_GROUPS } as Record<CostGroup, number>);

  const profitAed = round(revenueAed - totalCostAed, 2);
  const costPerBoxAed = boxes > 0 ? round(totalCostAed / boxes, 4) : 0;
  const costPerKgAed = netWeightKg > 0 ? round(totalCostAed / netWeightKg, 4) : 0;
  const costPerTonneAed = netWeightKg > 0 ? round((totalCostAed / netWeightKg) * 1000, 2) : 0;

  return {
    boxes,
    netWeightKg,
    grossWeightKg,
    kgPerBox,
    fx,
    purchaseInr,
    purchaseAed,
    purchasePerBoxInr: boxes > 0 ? round(purchaseInr / boxes, 2) : 0,
    purchasePerKgInr: netWeightKg > 0 ? round(purchaseInr / netWeightKg, 2) : 0,
    lines,
    groupInr,
    groupAed,
    totalCostInr,
    totalCostAed,
    costPerBoxAed,
    costPerKgAed,
    costPerTonneAed,
    revenueAed,
    revenuePerBoxAed: boxes > 0 ? round(revenueAed / boxes, 4) : 0,
    revenuePerKgAed: netWeightKg > 0 ? round(revenueAed / netWeightKg, 4) : 0,
    profitAed,
    profitPerBoxAed: boxes > 0 ? round(profitAed / boxes, 2) : 0,
    marginPct: revenueAed > 0 ? round((profitAed / revenueAed) * 100, 2) : 0,
    roiPct: totalCostAed > 0 ? round((profitAed / totalCostAed) * 100, 2) : 0,
    breakEvenPerBoxAed: boxes > 0 ? round(totalCostAed / boxes, 2) : 0,
    breakEvenPerKgAed: netWeightKg > 0 ? round(totalCostAed / netWeightKg, 2) : 0,
  };
}

/**
 * Convert the result into the backend `items[]` payload.
 * Everything is sent in INR (canonical cost sheet currency) plus the product
 * purchase itself, so the saved landed cost always includes goods + all
 * expenses. AED-quoted costs are converted at the same FX rate.
 */
export function toBackendItems(result: CalcResult): Array<{
  expenseCategory: string;
  expenseName: string;
  amount: number;
  currency: 'INR';
  costGroup: CostGroup;
}> {
  const items: Array<{
    expenseCategory: string;
    expenseName: string;
    amount: number;
    currency: 'INR';
    costGroup: CostGroup;
  }> = [];
  items.push({
    expenseCategory: 'PRODUCT',
    expenseName: 'Product purchase',
    amount: round(result.purchaseInr, 2),
    currency: 'INR' as const,
    costGroup: 'PURCHASE',
  });

  for (const line of result.lines) {
    items.push({
      expenseCategory: line.category,
      expenseName: line.name,
      amount: round(line.amountInr, 2),
      currency: 'INR' as const,
      costGroup: line.group,
    });
  }

  return items;
}

/** Whether a price unit refers to weight (used for labels + backend unit field). */
export function isPerKg(unit: PriceUnit): boolean {
  return unit === 'per kg';
}
