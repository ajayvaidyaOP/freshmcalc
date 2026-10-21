export interface MarketRate {
  id?: number;
  productVarietyId?: number;
  productName?: string;
  variety?: string;
  grade?: string;
  marketName?: string;
  country?: string;
  city?: string;
  priceAmount?: number;
  currency?: string;
  pricingUnit?: string;
  packagingDetails?: string;
  originCountry?: string;
  effectiveDateTime?: string;
  lastUpdated?: string;
  dataSource?: string;
  sourceReference?: string;
  automaticallyFetched?: boolean;
  status?: string;
  updatedBy?: string;
}

export interface Product {
  id?: number;
  name?: string;
  description?: string;
  category?: string;
  status?: string;
}

export interface ProductVariety {
  id?: number;
  productId?: number;
  productName?: string;
  variety?: string;
  grade?: string;
  defaultPackagingUnit?: string;
  status?: string;
}

export interface Port {
  id?: number;
  name?: string;
  unlocode?: string;
  portType?: string;
  countryName?: string;
  cityName?: string;
  supportsContainer?: boolean;
  supportsReefer?: boolean;
  active?: boolean;
}

export interface ShippingRoute {
  id?: number;
  originPortId?: number;
  originPortName?: string;
  destinationPortId?: number;
  destinationPortName?: string;
  transitTimeDays?: number;
  operational?: boolean;
}

export interface FreightQuote {
  id?: number;
  routeId?: number;
  containerType?: string;
  amount?: number;
  currency?: string;
  source?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface SubscriptionPlan {
  id?: number;
  name?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
  billingCycle?: string;
  dubaiRatesAccess?: boolean;
  calculatorAccess?: boolean;
  pdfExportAccess?: boolean;
  savedCalculationsAccess?: boolean;
  active?: boolean;
}

export interface Subscription {
  id?: number;
  planId?: number;
  planName?: string;
  status?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  active?: boolean;
}

export interface Payment {
  id?: number;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  description?: string;
}

export interface Calculation {
  id?: number;
  referenceNumber?: string;
  product?: string;
  variety?: string;
  grade?: string;
  status?: string;
  createdAt?: string;
  totalLandedCostAed?: number;
  grossProfitAed?: number;
  profitMarginPercent?: number;
}

export interface User {
  id?: number;
  email?: string;
  role?: string;
  status?: string;
}
