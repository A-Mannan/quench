import { ONE } from './types';

export function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator === 0n) return 0n;
  return (a * b) / denominator;
}

export function minBigInt(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function maxBigInt(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

export function formatAmount(value: bigint, decimals = 2): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / ONE;
  const fraction = (absolute % ONE).toString().padStart(18, '0').slice(0, decimals);
  const wholeText = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fractionText = decimals > 0 ? `.${fraction}` : '';
  return `${negative ? '-' : ''}${wholeText}${fractionText}`;
}

export function formatToken(value: bigint, symbol: string, decimals = 2): string {
  return `${formatAmount(value, decimals)} ${symbol}`;
}

export function formatPct(bps: number, decimals = 2): string {
  return `${(bps / 100).toFixed(decimals)}%`;
}

export function formatRate(value: bigint): string {
  return formatAmount(value, 4);
}

export function formatCompact(value: bigint): string {
  const amount = Number(value) / 1e18;
  if (!Number.isFinite(amount)) return '—';
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}m`;
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  if (Math.abs(amount) >= 100) return amount.toFixed(0);
  if (Math.abs(amount) >= 1) return amount.toFixed(1);
  return amount.toFixed(2);
}

export function toChartNumber(value: bigint): number {
  return Number(value) / 1e18;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function formatDateShort(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function monthsBetween(now: number, later: number): number {
  return Math.max(0, (later - now) / (30.4375 * 86_400_000));
}

export function parseTokenInput(input: string, decimals = 18): bigint {
  const clean = input.replace(/,/g, '').trim();
  if (!clean) return 0n;
  const match = clean.match(/^(\d*)(?:\.(\d*))?$/);
  if (!match) return 0n;
  const whole = match[1] ?? '';
  const fraction = (match[2] ?? '').slice(0, decimals).padEnd(decimals, '0');
  if (whole === '' && fraction === '') return 0n;
  const scale = 10n ** BigInt(decimals);
  return BigInt(whole || '0') * scale + BigInt(fraction || '0');
}

export function bpsOf(value: bigint, bps: number): bigint {
  return (value * BigInt(bps)) / 10_000n;
}