import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Get the start of today in a given timezone */
export function getStartOfDay(timezone: string = "UTC"): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
}

/** Convert a date to YYYY-MM-DD string */
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
