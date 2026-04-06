import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { uz } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export function formatDate(dateStr: string, fmt = "dd MMM yyyy"): string {
  try { return format(parseISO(dateStr), fmt, { locale: uz }); }
  catch { return dateStr; }
}

export function formatMonth(month: number, year: number): string {
  const m = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  return `${m[month - 1]} ${year}`;
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active:"bg-success-50 text-success-700 border-success-200",
    inactive:"bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700",
    graduated:"bg-blue-50 text-blue-700 border-blue-200",
    suspended:"bg-danger-50 text-danger-700 border-danger-200",
    upcoming:"bg-blue-50 text-blue-700 border-blue-200",
    completed:"bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700",
    cancelled:"bg-danger-50 text-danger-600 border-danger-200",
    new:"bg-blue-50 text-blue-700 border-blue-200",
    contacted:"bg-warning-50 text-warning-600 border-warning-200",
    trial:"bg-purple-50 text-purple-700 border-purple-200",
    registered:"bg-brand-50 text-brand-700 border-brand-200",
    paid:"bg-success-50 text-success-700 border-success-200",
    lost:"bg-danger-50 text-danger-600 border-danger-200",
    partial:"bg-warning-50 text-warning-600 border-warning-200",
    refunded:"bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700",
    present:"bg-success-50 text-success-700 border-success-200",
    absent:"bg-danger-50 text-danger-600 border-danger-200",
    late:"bg-warning-50 text-warning-600 border-warning-200",
    excused:"bg-blue-50 text-blue-600 border-blue-200",
    pending:"bg-warning-50 text-warning-600 border-warning-200",
  };
  return map[status] ?? "bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700";
}

export function getStatusLabel(status: string): string {
  const m: Record<string, string> = {
    active:"Faol",inactive:"Faol emas",graduated:"Bitirgan",suspended:"To'xtatilgan",
    upcoming:"Kutilmoqda",completed:"Yakunlangan",cancelled:"Bekor qilingan",
    new:"Yangi",contacted:"Bog'lanildi",trial:"Sinov darsi",registered:"Ro'yxatdan o'tdi",
    paid:"To'ladi",lost:"Yo'qoldi",partial:"Qisman",refunded:"Qaytarildi",
    present:"Keldi",absent:"Kelmadi",late:"Kechikdi",excused:"Sababli",
    pending:"Kutilmoqda",cash:"Naqd",card:"Karta",bank_transfer:"Bank o'tkazma",online:"Online",
    admin:"Administrator",manager:"Menejer",teacher:"O'qituvchi",user:"O'quvchi",asistend:"Assistent",
  };
  return m[status] ?? status;
}

export function getLeadSourceLabel(s: string): string {
  const m: Record<string, string> = {
    instagram:"Instagram",telegram:"Telegram",referral:"Tavsiya",
    walk_in:"Shaxsan keldi",website:"Veb-sayt",phone_call:"Telefon",other:"Boshqa",
  };
  return m[s] ?? s;
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as { response?: { data?: { message?: string | string[] } } };
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === "string") return msg;
  }
  if (error instanceof Error) return error.message;
  return "Xatolik yuz berdi";
}
