import { describe, expect, it } from 'vitest';
import {
  calculateExport,
  round,
  toBackendItems,
  type CalcInput,
  type CostLine,
} from './export-calc';

const base: CalcInput = {
  boxes: 1000,
  kgPerBox: 5,
  productCost: 400,
  productCostUnit: 'per box',
  sellingPrice: 40,
  sellingPriceUnit: 'per box',
  fx: 0.04,
  lines: [],
};

const line = (patch: Partial<CostLine>): CostLine => ({
  id: Math.random().toString(36),
  name: 'Cost',
  category: 'OTHER',
  group: 'ORIGIN',
  mode: 'amount',
  basis: 'shipment',
  currency: 'INR',
  amount: 0,
  enabled: true,
  ...patch,
});

describe('round', () => {
  it('rounds half-up without float artefacts', () => {
    expect(round(1.005)).toBe(1.01);
    expect(round(2.675)).toBe(2.68);
    expect(round(-1.005)).toBe(-1.01);
    expect(round(1.23456, 4)).toBe(1.2346);
  });
});

describe('calculateExport — purchase only', () => {
  it('computes landed cost, per-box/kg and profit', () => {
    const r = calculateExport(base);
    expect(r.netWeightKg).toBe(5000);
    expect(r.grossWeightKg).toBe(5300);
    expect(r.purchaseInr).toBe(400_000);
    expect(r.purchaseAed).toBe(16_000);
    expect(r.totalCostInr).toBe(400_000);
    expect(r.totalCostAed).toBe(16_000);
    expect(r.revenueAed).toBe(40_000);
    expect(r.profitAed).toBe(24_000);
    expect(r.marginPct).toBe(60);
    expect(r.roiPct).toBe(150);
    expect(r.costPerBoxAed).toBe(16);
    expect(r.costPerKgAed).toBe(3.2);
    expect(r.costPerTonneAed).toBe(3200);
    expect(r.breakEvenPerBoxAed).toBe(16);
    expect(r.breakEvenPerKgAed).toBe(3.2);
  });

  it('respects per-kg purchase and per-kg selling prices', () => {
    const r = calculateExport({
      ...base,
      productCost: 80,
      productCostUnit: 'per kg',
      sellingPrice: 8,
      sellingPriceUnit: 'per kg',
    });
    // 80 INR/kg × 5000 kg = 400,000 INR → 16,000 AED
    expect(r.purchaseInr).toBe(400_000);
    expect(r.revenueAed).toBe(40_000);
    expect(r.profitAed).toBe(24_000);
  });

  it('handles zero volume without dividing by zero', () => {
    const r = calculateExport({ ...base, boxes: 0, productCost: 0, sellingPrice: 0 });
    expect(r.totalCostAed).toBe(0);
    expect(r.costPerBoxAed).toBe(0);
    expect(r.marginPct).toBe(0);
    expect(r.roiPct).toBe(0);
    expect(r.breakEvenPerBoxAed).toBe(0);
  });
});

describe('calculateExport — cost heads', () => {
  const lines: CostLine[] = [
    line({ id: 'packing', name: 'Packing', group: 'ORIGIN', basis: 'box', amount: 50 }), // 50,000 INR
    line({ id: 'cha', name: 'CHA', group: 'ORIGIN', amount: 10_000 }),
    line({ id: 'freight', name: 'Freight', group: 'FREIGHT', amount: 100_000 }),
    line({
      id: 'insurance',
      name: 'Insurance',
      group: 'FREIGHT',
      mode: 'percent',
      percent: 0.5,
      percentBase: 'purchase',
    }), // 0.5% × 400,000 = 2,000
    line({
      id: 'commission',
      name: 'Commission',
      group: 'COMMISSION_TAX',
      mode: 'percent',
      percent: 5,
      percentBase: 'revenue',
    }), // 5% × 40,000 AED = 2,000 AED (50,000 INR at 0.04)
    line({ id: 'dest', name: 'Dubai handling', group: 'DESTINATION', currency: 'AED', amount: 500 }),
    line({ id: 'off', name: 'Disabled', group: 'ORIGIN', amount: 999_999, enabled: false }),
  ];

  const r = calculateExport({ ...base, lines });

  it('sums groups in INR and AED', () => {
    expect(r.groupInr.ORIGIN).toBe(60_000);
    expect(r.groupInr.FREIGHT).toBe(102_000);
    expect(r.groupInr.DESTINATION).toBe(12_500); // 500 AED ÷ 0.04
    expect(r.groupInr.COMMISSION_TAX).toBe(50_000);
    expect(r.groupInr.PURCHASE).toBe(400_000);
    expect(r.totalCostInr).toBe(624_500);
    expect(r.totalCostAed).toBe(24_980);
    expect(r.groupAed.FREIGHT).toBe(4_080);
  });

  it('excludes disabled lines and never double-converts AED', () => {
    expect(r.lines.some((l) => l.id === 'off')).toBe(false);
    expect(r.lines.find((l) => l.id === 'dest')?.amountInr).toBe(12_500);
    expect(r.lines.find((l) => l.id === 'commission')?.amountAed).toBe(2_000);
  });

  it('computes profit, margin and break-even from the full landed cost', () => {
    expect(r.revenueAed).toBe(40_000);
    expect(r.profitAed).toBe(15_020);
    expect(r.profitPerBoxAed).toBe(15.02);
    expect(r.marginPct).toBe(37.55);
    expect(r.roiPct).toBe(60.13);
    expect(r.breakEvenPerBoxAed).toBe(24.98);
  });

  it('applies shipment, single-container, carton, kilogram and tonne bases', () => {
    const result = calculateExport({
      ...base,
      lines: [
        line({ id: 'shipment', amount: 1000, basis: 'shipment' }),
        line({ id: 'container', amount: 2000, basis: 'container' }),
        line({ id: 'carton', amount: 3, basis: 'carton' }),
        line({ id: 'kg', amount: 2, basis: 'kg' }),
        line({ id: 'tonne', amount: 4, basis: 'tonne' }),
      ],
    });
    expect(result.lines.map((item) => item.amountInr)).toEqual([1000, 2000, 3000, 10000, 20]);
  });

  it('resolves % of freight after fixed freight lines', () => {
    const withFreightPct = calculateExport({
      ...base,
      lines: [
        line({ id: 'freight', name: 'Freight', group: 'FREIGHT', amount: 100_000 }),
        line({
          id: 'fh',
          name: 'Freight handling',
          group: 'FREIGHT',
          mode: 'percent',
          percent: 10,
          percentBase: 'freight',
        }),
      ],
    });
    expect(withFreightPct.groupInr.FREIGHT).toBe(110_000);
  });
});

describe('toBackendItems', () => {
  it('sends purchase + every enabled line in INR, summing to the total', () => {
    const r = calculateExport({
      ...base,
      lines: [
        line({ id: 'cha', name: 'CHA', group: 'ORIGIN', amount: 10_000 }),
        line({ id: 'dest', name: 'Dubai', group: 'DESTINATION', currency: 'AED', amount: 500 }),
      ],
    });
    const items = toBackendItems(r);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ expenseName: 'Product purchase', costGroup: 'PURCHASE', amount: 400_000 });
    expect(items.every((i) => i.currency === 'INR')).toBe(true);

    const shipped = items.reduce((sum, i) => sum + i.amount, 0);
    expect(round(shipped, 2)).toBe(r.totalCostInr);
  });

  it('preserves provenance for configured, sample and user-entered cost lines', () => {
    const result = calculateExport({
      ...base,
      lines: [
        line({ id: 'port-charge-7', name: 'Port handling · verified', amount: 100, note: 'Source: port authority; valid to 2030-01-01.' }),
        line({ id: 'manual', name: 'Broker fee', custom: true, amount: 50 }),
        line({ id: 'sample', name: 'Illustrative packing', note: 'Replace with a quote.', amount: 25 }),
      ],
    });
    const items = toBackendItems(result);
    expect(items[1].sourceNote).toBe('Source: port authority; valid to 2030-01-01.');
    expect(items[2].sourceNote).toContain('User-entered cost');
    expect(items[3].sourceNote).toContain('Illustrative sample cost');
  });
});
