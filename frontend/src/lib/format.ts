/** Shared formatting helpers (currency, numbers, dates) used across the app. */

export function formatNumber(value?: number | null, digits = 2): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatAED(value?: number | null, digits = 2): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—';
  return `AED ${formatNumber(value, digits)}`;
}

export function formatINR(value?: number | null, digits = 0): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—';
  return `₹${formatNumber(value, digits)}`;
}

/** Backend stores plan prices in paise (e.g. 49900 = ₹499). */
export function formatPaise(paise?: number | null): string {
  if (paise === undefined || paise === null) return '—';
  return formatINR(paise / 100);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "5 min ago", "3 hrs ago", "2 days ago" — freshness labels for market rates. */
export function timeAgo(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(value);
}

/** Fresh (<24h) / recent (<72h) / stale — drives the coloured freshness dot. */
export function freshness(value?: string | null): 'fresh' | 'recent' | 'stale' | 'unknown' {
  if (!value) return 'unknown';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const hours = (Date.now() - d.getTime()) / 3_600_000;
  if (hours <= 24) return 'fresh';
  if (hours <= 72) return 'recent';
  return 'stale';
}

export function initials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'F';
  const clean = nameOrEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'F';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function displayName(user: any): string {
  if (!user) return 'Trader';
  const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  if (full) return full;
  if (user.email) {
    const raw = user.email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    return raw.replace(/\b\w/g, (c: string) => c.toUpperCase());
  }
  return 'Trader';
}
