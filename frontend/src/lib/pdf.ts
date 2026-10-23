import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { isNativeApp } from '@/lib/platform';

export interface QuotationItem {
  name?: string;
  /** Backend field name (saved calculation items). */
  expenseName?: string;
  group?: string;
  /** Backend field name (saved calculation items). */
  costGroup?: string;
  amountInr?: number;
  /** Backend field name — INR amount of the line. */
  amount?: number;
  amountAed?: number;
  /** Provenance for configured, illustrative, or user-entered costs when recorded. */
  sourceNote?: string;
  note?: string;
}

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
  items?: QuotationItem[];
}

const GROUP_ORDER = ['PURCHASE', 'ORIGIN', 'FREIGHT', 'DESTINATION', 'COMMISSION_TAX'];
const GROUP_LABELS: Record<string, string> = {
  PURCHASE: 'Product purchase',
  ORIGIN: 'Origin charges',
  FREIGHT: 'International freight & insurance',
  DESTINATION: 'Destination charges',
  COMMISSION_TAX: 'Commission, taxes & other costs',
};

const money = (value: number | undefined, currency: string) =>
  value === undefined || value === null || Number.isNaN(Number(value))
    ? '—'
    : `${currency} ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const qty = (value: number | undefined, suffix: string) =>
  value === undefined || value === null ? '—' : `${Number(value).toLocaleString('en-IN')} ${suffix}`;

/**
 * Generate a branded export-costing / quotation PDF for a calculation.
 * The PDF renders the saved snapshot only — it never recalculates money, so a
 * historical quotation can't silently change when rates move.
 */
/**
 * Build and deliver the quotation.
 *
 * Web: a normal browser download.
 * Native (Capacitor): WKWebView/Android WebView cannot download a blob, so the
 * PDF is written to the app cache and handed to the system share sheet — the
 * user can save it to Files, mail it, or send it on WhatsApp.
 */
export async function generateQuotationPdf(data: QuotationData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  /* ---------------------------------------------------------------- header */
  doc.setFillColor(12, 43, 30);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setFillColor(163, 230, 53);
  doc.rect(0, 34, pageWidth, 1.4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('FreshmCalc', 16, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 230, 210);
  doc.text('Dubai market rates  ·  India → Dubai export costing', 16, 22.5);
  doc.setFontSize(8.5);
  doc.text('All selling prices are Dubai, UAE wholesale prices in AED.', 16, 27.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('EXPORT COST SHEET', pageWidth - 16, 15, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Ref: ${data.referenceNumber || 'DRAFT'}`, pageWidth - 16, 21.5, { align: 'right' });
  doc.text(
    `Date: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}`,
    pageWidth - 16,
    27,
    { align: 'right' }
  );

  /* ------------------------------------------------------- shipment summary */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 67, 47);
  doc.text('Shipment', 16, 46);

  const summaryLeft = [
    ['Product', [data.product, data.variety, data.grade].filter(Boolean).join(' · ') || '—'],
    ['Route', `${data.originPort || 'Origin'} → ${data.destinationPort || 'Jebel Ali, Dubai'}`],
  ];
  const summaryRight = [
    ['Container', data.containerType || 'REEFER'],
    ['Boxes / net weight', `${qty(data.numberOfBoxes, 'boxes')}  ·  ${qty(data.netWeightKg, 'kg')}`],
    ['FX rate', `1 INR = ${data.conversionRateInrToAed ?? '—'} AED`],
  ];

  doc.setFontSize(8.8);
  let y = 52;
  for (const [label, value] of summaryLeft) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(105, 115, 110);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 40, 35);
    doc.text(String(value), 52, y);
    y += 5.4;
  }
  y = 52;
  for (const [label, value] of summaryRight) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(105, 115, 110);
    doc.text(label, 108, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 40, 35);
    doc.text(String(value), 139, y);
    y += 5.4;
  }

  /* ----------------------------------------------------------- line items */
  const itemRows: Array<Array<string | number>> = [];
  const items = (data.items || []).map((item) => ({
    name: item.name || item.expenseName || 'Cost',
    group: item.group || item.costGroup || 'ORIGIN',
    inr: Number(item.amountInr ?? item.amount ?? 0),
    aed: Number(item.amountAed ?? 0),
    note: item.sourceNote || item.note,
  }));

  if (items.length > 0) {
    for (const group of GROUP_ORDER) {
      const groupItems = items.filter((item) => item.group === group);
      if (groupItems.length === 0) continue;
      for (const item of groupItems) {
        itemRows.push([GROUP_LABELS[group] || group, item.note ? `${item.name}\n${item.note}` : item.name, money(item.inr, 'INR'), money(item.aed, 'AED')]);
      }
    }
  } else {
    itemRows.push(
      ['Product purchase', 'Product purchase cost (INR)', money(data.totalPurchaseInr, 'INR'), '—'],
      ['Origin charges', 'Packing, transport, port, customs clearance and documents', money(data.totalOriginInr, 'INR'), '—'],
      ['Freight & insurance', 'Ocean freight and marine insurance', money(data.totalFreightInr, 'INR'), '—'],
      ['Destination charges', 'Customs clearance, handling and delivery', money(data.totalDestinationInr, 'INR'), '—'],
      ['Commission, taxes & other costs', 'Commission, duty and bank charges', money(data.totalCommissionTaxInr, 'INR'), '—']
    );
  }

  if (itemRows.length > 0) {
    (doc as any).autoTable({
      startY: 72,
      head: [['Cost group', 'Cost head', 'Amount (INR)', 'Amount (AED)']],
      body: itemRows,
      theme: 'plain',
      styles: { fontSize: 8.2, cellPadding: 2.4, textColor: [40, 50, 45] },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [234, 244, 237],
        textColor: [23, 67, 47],
        lineWidth: 0.1,
        lineColor: [190, 214, 199],
      },
      alternateRowStyles: { fillColor: [249, 252, 250] },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 84 },
        2: { halign: 'right', cellWidth: 28 },
        3: { halign: 'right', cellWidth: 28 },
      },
      margin: { left: 16, right: 16 },
    });
  }

  const afterItems = ((doc as any).autoTable?.previous?.endY as number) || 80;

  /* --------------------------------------------------------------- totals */
  const totals = [
    ['Goods purchased in India', money(data.totalPurchaseInr, 'INR')],
    ['Origin charges (packing, transport, port and customs clearance)', money(data.totalOriginInr, 'INR')],
    ['Freight & insurance', money(data.totalFreightInr, 'INR')],
    ['Destination charges (customs clearance, handling and delivery)', money(data.totalDestinationInr, 'INR')],
    ['Commission, taxes & other costs', money(data.totalCommissionTaxInr, 'INR')],
  ];

  const totalsTop = Math.min(afterItems + 5, 232);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(23, 67, 47);
  doc.text('Cost summary', 16, totalsTop);

  doc.setFontSize(8.6);
  let ty = totalsTop + 6;
  for (const [label, value] of totals) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 105, 100);
    doc.text(label, 16, ty);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 40, 35);
    doc.text(String(value), 122, ty, { align: 'right' });
    ty += 5;
  }
  doc.setDrawColor(190, 214, 199);
  doc.line(16, ty - 1, 122, ty - 1);
  ty += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Total shipment cost (INR)', 16, ty);
  doc.text(money(data.totalShipmentCostInr, 'INR'), 122, ty, { align: 'right' });
  ty += 5;
  doc.setTextColor(23, 67, 47);
  doc.text('Total landed cost (AED)', 16, ty);
  doc.text(money(data.totalLandedCostAed, 'AED'), 122, ty, { align: 'right' });
  ty += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(120, 130, 125);
  doc.text(
    `Cost per box ${money(data.costPerBoxAed, 'AED')}  ·  per kg ${money(data.costPerKgAed, 'AED')}  ·  per tonne ${money(data.costPerTonneAed, 'AED')}`,
    16,
    ty + 2.5
  );

  /* --------------------------------------------------------------- result */
  const cardX = 132;
  const cardY = totalsTop - 4;
  doc.setFillColor(12, 43, 30);
  doc.roundedRect(cardX, cardY, pageWidth - cardX - 16, 52, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(170, 205, 180);
  doc.text('DUBAI SALE VALUE', cardX + 7, cardY + 10);
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(money(data.expectedRevenueAed, 'AED'), cardX + 7, cardY + 17);
  doc.setFontSize(8.5);
  doc.setTextColor(170, 205, 180);
  doc.text('ESTIMATED GROSS PROFIT', cardX + 7, cardY + 27);
  doc.setFontSize(13);
  doc.setTextColor(190, 242, 100);
  doc.text(money(data.grossProfitAed, 'AED'), cardX + 7, cardY + 34);
  doc.setFontSize(8.5);
  doc.setTextColor(170, 205, 180);
  doc.text('MARGIN', cardX + 7, cardY + 43);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${data.profitMarginPercent !== undefined ? Number(data.profitMarginPercent).toFixed(2) : '—'}%`, cardX + 29, cardY + 43);

  /* --------------------------------------------------------------- footer */
  const footerY = 276;
  doc.setDrawColor(220, 230, 223);
  doc.line(16, footerY, pageWidth - 16, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(125, 135, 130);
  doc.text(
    'This is an estimate based on saved inputs, not a binding carrier quote, customs assessment or tax invoice. Verify charges with your providers.',
    16,
    footerY + 4.5,
    { maxWidth: pageWidth - 32 }
  );
  doc.text(
    'FreshmCalc · Dubai wholesale rates in AED · India is the sourcing origin · freshmcalc.com',
    16,
    footerY + 10
  );

  const filename = `freshmcalc-costing-${(data.referenceNumber || 'draft').replace(/[^\w-]+/g, '_')}.pdf`;

  if (isNativeApp()) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ]);
    // jsPDF data URI → base64 body; Filesystem writes base64 by default.
    const base64 = doc.output('datauristring').split(',')[1] ?? '';
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title: 'FreshmCalc quotation',
      text: `FreshmCalc costing ${data.referenceNumber || 'draft'}`,
      url: written.uri,
      dialogTitle: 'Save or share your quotation',
    });
    return;
  }

  doc.save(filename);
}
