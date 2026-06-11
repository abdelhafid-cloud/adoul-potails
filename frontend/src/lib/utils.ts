import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = "fr-MA") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}

export function formatDate(date: string | Date, locale = "fr-MA") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
