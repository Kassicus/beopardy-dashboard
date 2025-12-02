import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date, formatStr = "MMM d, yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercentage(value: number | null, decimals = 1): string {
  if (value === null) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatPoints(points: number): string {
  return formatNumber(points);
}

export function formatOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
