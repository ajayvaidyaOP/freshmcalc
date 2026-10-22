# Export costing — formula, cost heads and worked example

Everything the calculator shows comes from one pure function,
`frontend/src/lib/export-calc.ts` (`calculateExport`). The backend repeats the
same arithmetic in `CalculationService` and stores the result as an immutable
snapshot. Both use the same rounding rules, so the live preview and the saved
sheet never disagree.

> **Business rule:** every selling price is a **Dubai wholesale price in AED**.
> India is the sourcing origin; Indian domestic prices are never shown as Dubai
> prices.

---

## 1. Inputs

| Input | Meaning | Example |
|---|---|---|
| `boxes` | cartons in the consignment | 2,200 |
| `kgPerBox` | net weight per carton | 5 kg |
| `productCost` + unit | what you pay in India, per box or per kg | ₹450 / box |
| `sellingPrice` + unit | expected Dubai price, per box or per kg | AED 42.50 / box |
| `fx` | 1 INR in AED | 0.0417 |
| `lines[]` | export cost heads (see below) | editable |

Net and gross weight:

```
netWeightKg   = boxes × kgPerBox
grossWeightKg = measured gross weight, else netWeightKg × 1.06   (6% packing)
```

---

## 2. Cost heads

Costs are grouped exactly like a real export file. Each line is either a fixed
amount (per shipment or per box, in INR or AED) or a percentage of a base.

| Group | Typical heads | How it is charged |
|---|---|---|
| **PURCHASE** | goods bought from farmer / packhouse | per box or per kg, always included by the server |
| **ORIGIN** | packing material & labour, inland trucking, port/THC, **CHA** & documentation | per box or per shipment |
| **FREIGHT** | ocean freight (reefer), marine insurance | per shipment, or % of purchase value |
| **DESTINATION** | Jebel Ali handling, Dubai clearing agent, delivery to market | AED or INR per shipment |
| **COMMISSION_TAX** | mandi commission, UAE customs duty (if any), bank charges | % of sale value, % of purchase, or fixed |

Default starting points (`frontend/src/lib/expense-presets.ts`):

| Cost head | Default | Basis |
|---|---|---|
| Packing material & labour | ₹55 | per box |
| Inland transport (packhouse → port) | ₹22,000 | per shipment |
| Port handling & THC (origin) | ₹14,500 | per shipment |
| Customs clearance & CHA (India) | ₹9,000 | per shipment |
| Ocean freight (reefer) | ₹125,000 | per shipment |
| Marine cargo insurance | 0.35% | of purchase value |
| Dubai clearing & handling | AED 850 | per shipment |
| Dubai market commission (mandi) | 5% | of sale value |
| Bank & remittance charges | AED 250 | per shipment |
| UAE customs duty | 5% (off by default) | of purchase value |

**These are editable assumptions, not official tariffs.** Freight, THC, CHA and
commission move weekly — always replace them with your forwarder's quote.

---

## 3. The maths

### Purchase

```
purchaseInr = productCost × boxes                 (unit = per box)
purchaseInr = productCost × netWeightKg           (unit = per kg)
purchaseAed = purchaseInr × fx
```

### Fixed cost lines

```
amountInr = value × (basis = per box ? boxes : 1)        (INR line)
amountAed = value × (basis = per box ? boxes : 1)        (AED line)
amountInr = amountAed / fx                               (AED line, canonical INR)
```

### Percentage cost lines

```
% of purchase  → amountInr = purchaseInr × pct      ; amountAed = amountInr × fx
% of freight   → amountInr = freightSubtotal × pct  ; amountAed = amountInr × fx
% of sale      → amountAed = revenueAed × pct       ; amountInr = amountAed / fx
```

Two passes make this deterministic: fixed amounts first (so "% of freight"
knows the freight total), then percentages.

### Revenue

```
revenueAed = sellingPrice × boxes        (unit = per box)
revenueAed = sellingPrice × netWeightKg  (unit = per kg)
```

### Landed cost and profit

```
totalCostInr = purchase + origin + freight + destination + commissionTax   (all in INR)
totalCostAed = totalCostInr × fx
profitAed    = revenueAed − totalCostAed
costPerBoxAed = totalCostAed / boxes
costPerKgAed  = totalCostAed / netWeightKg
marginPct     = profitAed / revenueAed × 100
roiPct        = profitAed / totalCostAed × 100          (return on money spent)
breakEvenPerBoxAed = totalCostAed / boxes               (price you must get to not lose money)
```

`profitPerBoxAed = profitAed / boxes`.

**Margin vs ROI:** margin tells you how much of each dirham of sales is profit;
ROI tells you how hard your invested capital is working. A 36% margin on a 57%
ROI means every AED 1 of cost returns AED 1.57 of sale value. Watch ROI when
comparing two shipments of different cost structures.

### Rounding

| Quantity | Rule |
|---|---|
| Money / totals | 2 decimals, half-up |
| Unit costs (per box, per kg) | 4 decimals |
| FX rate | up to 6 decimals (input) |

This mirrors the backend's `BigDecimal` + `RoundingMode.HALF_UP`, so
₹1.005 becomes ₹1.01 in both places rather than ₹1.00 (a classic float bug).

---

## 4. Worked example (defaults in the app)

2,200 boxes × 5 kg pomegranate · ₹450/box · Dubai AED 42.50/box · FX 0.0417.

```
net weight           = 11,000 kg          gross weight = 11,660 kg
purchase             = 2,200 × 450       = ₹9,90,000     → AED 41,283.00
packing              = 2,200 × 55        = ₹1,21,000
inland transport                          = ₹22,000
origin port / THC                         = ₹14,500
CHA & documents                           = ₹9,000
ocean freight                             = ₹1,25,000
insurance            = 0.35% × 9,90,000   = ₹3,465
Dubai handling                            = AED 850      → ₹20,383.69
mandi commission     = 5% × 93,500 AED    = AED 4,675    → ₹1,12,110.31
bank charges                              = AED 250      → ₹5,995.20
--------------------------------------------------------------------------------
total landed cost                         = ₹14,23,454.20 → AED 59,358.04
```

```
Dubai sale value     = 2,200 × 42.50 = AED 93,500.00
profit               = 93,500.00 − 59,358.04 = AED 34,141.96
cost per box         = AED 26.98      cost per kg = AED 5.40
profit per box       = AED 15.52
margin               = 36.52%         ROI = 57.52%
break-even price     = AED 26.98 / box
```

If the Dubai price falls to **AED 26.98/box**, the shipment makes exactly zero.
Below that, the calculator shows a red negative margin.

---

## 5. What the backend stores

The client sends `items[]`, all in INR, with a `costGroup`:

```json
{ "expenseCategory": "CHA", "expenseName": "Customs clearance & CHA (India)",
  "amount": 9000, "currency": "INR", "costGroup": "ORIGIN" }
```

`POST /api/v1/calculations` then:

1. Adds the product purchase itself if no `PURCHASE` item is present
   (computed from `productCostPerUnit` × boxes or kg).
2. Sums each group in INR, converts AED-quoted lines with the same FX rate.
3. Computes `totalShipmentCostInr`, `totalLandedCostAed`, per-box / per-kg /
   per-tonne costs, revenue, gross profit and margin.
4. Saves an immutable snapshot with a reference number (e.g. `FM-3C9A1B77`).

Historical sheets never change when rates or expense templates are updated —
that is deliberate, because quotations must be reproducible.

---

## 6. Known limits (be honest with buyers)

- Duty is a **setting, not legal advice**. Fresh produce often enters the UAE
  duty-free, but HS-code specifics and country-of-origin rules apply.
- The UAE 5% VAT treatment of wholesale produce and freight is not modelled.
- Demurrage, detention, rejection/wastage and cold-chain claims are not in the
  default sheet — add them as custom costs when relevant.
- Prices entered by the user are not market-validated; the Dubai rate shown in
  the app is a publisher-entered market rate, not an exchange tick.
- The PDF is a **costing estimate**, not a tax invoice.
