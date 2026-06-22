import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderState } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function formatPhone(phone: string): string {
  if (phone.length >= 12) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 8)}-${phone.slice(8)}`;
  }
  return phone;
}

export function todayStart(): string {
  // Usa timezone Argentina (UTC-3, sin DST) tanto en browser como en server (Vercel corre en UTC).
  const now = new Date();
  const argDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }); // "2026-06-19"
  const [y, m, d] = argDateStr.split("-").map(Number);
  // Medianoche Argentina = 03:00 UTC
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0)).toISOString();
}

export const STATE_LABEL: Record<OrderState, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  sent: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const STATE_COLOR: Record<OrderState, string> = {
  pending: "text-red-400",
  confirmed: "text-red-300",
  preparing: "text-amber-400",
  ready: "text-green-400",
  sent: "text-green-300",
  delivered: "text-zinc-500",
  cancelled: "text-zinc-600",
};

export const STATE_BG: Record<OrderState, string> = {
  pending: "bg-red-400/10 border-red-400/20",
  confirmed: "bg-red-300/10 border-red-300/20",
  preparing: "bg-amber-400/10 border-amber-400/20",
  ready: "bg-green-400/10 border-green-400/20",
  sent: "bg-green-300/10 border-green-300/20",
  delivered: "bg-zinc-800/50 border-zinc-700/30",
  cancelled: "bg-zinc-800/30 border-zinc-700/20",
};
