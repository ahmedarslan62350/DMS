import { env } from "@/config/env";

const TOKEN_KEY = env.TOKEN_KEY || "token";

export class TokenStorage {
  static set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static get() {
    return localStorage.getItem(TOKEN_KEY);
  }

  static remove() {
    localStorage.removeItem(TOKEN_KEY);
  }

  static isAuthenticated() {
    return !!this.get();
  }
}

const notImpFields = ["_id", "createdAt", "updatedAt", "__v"];

export const isImpField = (field: string) => {
  if (notImpFields.includes(field)) return false;
  return true;
};

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatCurrency = (value: unknown) => {
  const n = Number(value);
  return currencyFormatter.format(Number.isFinite(n) ? n : 0);
};

export const formatNumber = (value: unknown) => {
  const n = Number(value);
  return numberFormatter.format(Number.isFinite(n) ? n : 0);
};

/** Whole days from now until `date`. Negative when the date has passed. */
export const daysUntil = (date: string | Date | null | undefined) => {
  if (!date) return Number.NaN;
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return Number.NaN;
  return Math.ceil((target - Date.now()) / 86_400_000);
};

export const formatDate = (
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", options);
};

export const formatDateTime = (date: string | Date | null | undefined) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Render an audit value without ever printing "null" or "[object Object]". */
export const formatAuditValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "null") return "—";
    return trimmed;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }
  return String(value);
};

