import {
  LayoutDashboard,
  Smartphone,
  TrendingUp,
  History,
  Calculator,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  Package,
  Ship,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  planFeature?: 'dubaiRatesAccess' | 'calculatorAccess' | 'pdfExportAccess' | 'savedCalculationsAccess';
}

export const MARKET_ITEMS: NavItem[] = [
  { label: 'Market Overview', shortLabel: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Dubai Live Rates', shortLabel: 'Rates', href: '/rates', icon: TrendingUp, planFeature: 'dubaiRatesAccess' },
  { label: 'Price History', shortLabel: 'History', href: '/rates/history', icon: History, planFeature: 'dubaiRatesAccess' },
  { label: 'Export Calculator', shortLabel: 'Calculator', href: '/calculator', icon: Calculator, planFeature: 'calculatorAccess' },
  { label: 'Saved Cost Sheets', shortLabel: 'Sheets', href: '/calculations', icon: FileText, planFeature: 'savedCalculationsAccess' },
];

export const ACCOUNT_ITEMS: NavItem[] = [
  { label: 'Subscription & Billing', shortLabel: 'Billing', href: '/subscription', icon: CreditCard },
  { label: 'Account Settings', shortLabel: 'Settings', href: '/settings', icon: Settings },
  { label: 'Get the app', shortLabel: 'App', href: '/get-app', icon: Smartphone },
];

export const ADMIN_ITEMS: NavItem[] = [
  { label: 'Admin Dashboard', shortLabel: 'Admin', href: '/admin', icon: ShieldCheck },
  { label: 'Manage Market Rates', shortLabel: 'Rates', href: '/admin/rates', icon: TrendingUp },
  { label: 'Products & Varieties', shortLabel: 'Products', href: '/admin/products', icon: Package },
  { label: 'Ports & Routes', shortLabel: 'Ports', href: '/admin/ports', icon: Ship },
  { label: 'Users & Subscriptions', shortLabel: 'Users', href: '/admin/users', icon: Users },
];

/** Bottom-navigation items for phones (Calculator sits in the raised centre slot). */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  MARKET_ITEMS[0],
  MARKET_ITEMS[1],
  MARKET_ITEMS[3],
  MARKET_ITEMS[4],
  ACCOUNT_ITEMS[1],
];

export function hasFeature(user: any, feature?: string): boolean {
  if (!feature) return true;
  if (user?.role === 'ADMIN') return true;
  return Boolean(user?.planEntitlements?.[feature]);
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/rates') return pathname === '/rates';
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
}
