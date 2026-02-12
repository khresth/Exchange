import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: string | number, decimals: number = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toFixed(decimals);
}

export function formatPercent(num: string | number): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0.00%';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function formatCurrency(num: string | number, symbol: string = '$'): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return `${symbol}0.00`;
  return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLargeNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  
  return n.toFixed(2);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getTimestamp(): number {
  return Date.now();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
