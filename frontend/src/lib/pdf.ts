import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface QuotationData {
  referenceNumber: string;
  product: string;
  variety?: string;
  grade?: string;
  originPort?: string;
  destinationPort?: string;
  containerType?: string;
  numberOfBoxes?: number;
  netWeightKg?: number;
  conversionRateInrToAed?: number;
  totalPurchaseInr?: number;
  totalOriginInr?: number;
  totalFreightInr?: number;
  totalDestinationInr?: number;
  totalCommissionTaxInr?: number;
  totalShipmentCostInr?: number;
  totalLandedCostAed?: number;
  costPerBoxAed?: number;
  costPerKgAed?: number;
  costPerTonneAed?: number;
  expectedRevenueAed?: number;
  grossProfitAed?: number;
  profitMarginPercent?: number;
  createdAt?: string;
}

/**
 * Generate a PDF quotation for a saved calculation.
 * Backend is the source of truth for calculation values; this renders the snapshot.
 */
export function generateQuotationPdf(data: QuotationData) {
  const doc = new jsPDF();
  const title = 'FreshmCalc — Export Quotation';
  doc.setFontSize(18);
  doc.setTextColor(15, 42, 67); // navy
  doc.text(title, 20, 22);
  doc.setFontSize(11);
  doc.setTextColor(90, 100, 110);
  doc.text('Reference: ' + (data.referenceNumber ?? '—'), 20, 34);
  doc.text('Date: ' + (data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'), 20, 42);
  doc.text('Market: Dubai, UAE  |  Currency: AED  |  Sourcing origin: India', 20, 50);

  const rows: any[][] = [
    ['Product', data.product ?? '—'],
    ['Variety / Grade', ((data.variety ?? '') + ' / ' + (data.grade ?? '')).trim() || '—'],
    ['Origin port → Destination port', `${data.originPort ?? '—'} → ${data.destinationPort ?? '—'}`],
    ['Container type', data.containerType ?? '—'],
    ['Number of boxes', data.numberOfBoxes?.toString() ?? '—'],
    ['Net weight (kg)', data.netWeightKg?.toString() ?? '—'],
    ['INR → AED rate', data.conversionRateInrToAed?.toString() ?? '—'],
    ['Product purchase cost (INR)', data.totalPurchaseInr?.toFixed(2) ?? '—'],
    ['Packing & origin expenses (INR)', data.totalOriginInr?.toFixed(2) ?? '—'],
    ['Freight & logistics (INR)', data.totalFreightInr?.toFixed(2) ?? '—'],
    ['Destination & CHA (INR)', data.totalDestinationInr?.toFixed(2) ?? '—'],
    ['Commission & taxes (INR)', data.totalCommissionTaxInr?.toFixed(2) ?? '—'],
    ['Total shipment cost (INR)', data.totalShipmentCostInr?.toFixed(2) ?? '—'],
    ['Total landed cost (AED)', data.totalLandedCostAed?.toFixed(2) ?? '—'],
    ['Cost per box (AED)', data.costPerBoxAed?.toFixed(2) ?? '—'],
    ['Cost per kg (AED)', data.costPerKgAed?.toFixed(2) ?? '—'],
    ['Cost per tonne (AED)', data.costPerTonneAed?.toFixed(2) ?? '—'],
    ['Expected Dubai revenue (AED)', data.expectedRevenueAed?.toFixed(2) ?? '—'],
    ['Estimated gross profit (AED)', data.grossProfitAed?.toFixed(2) ?? '—'],
    ['Profit margin (%)', data.profitMarginPercent?.toFixed(2) ?? '—'],
  ];

  ;(doc as any).autoTable({
    startY: 60,
    head: [['Cost breakdown', 'Value']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 42, 67] },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 20, right: 20 },
  });

  const endY = (doc as any).autoTable.previous?.endY || 280;
  doc.text('All amounts are based on the saved calculation snapshot. Historical values never silently change.', 20, endY + 12);
  doc.text('FreshmCalc — Dubai market rates and India-to-Dubai export costing.', 20, endY + 22);

  doc.save(`freshmcalc-quotation-${data.referenceNumber?.replace(/\s+/g, '_') || 'calculation'}.pdf`);
}
