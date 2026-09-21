// Presentation helpers (FE-04). Pure formatting, no business rules.

import type { Event } from "./types";

export function formatDateWib(iso: string): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
  return `${formatted.replace(":", ".")} WIB`;
}

export function formatDeadlineWib(iso: string): string {
  return formatDateWib(iso);
}

export function quotaPercent(current: number, quota: number): number {
  if (quota <= 0) return 0;
  return Math.min(100, Math.round((current / quota) * 100));
}

export type AvailabilityKey = "open" | "full" | "closed";

export function availabilityOf(event: Event): {
  key: AvailabilityKey;
  label: string;
} {
  if (event.currentParticipants >= event.quota)
    return { key: "full", label: "Kuota penuh" };
  if (new Date(event.deadline).getTime() < Date.now())
    return { key: "closed", label: "Ditutup" };
  return { key: "open", label: "Dibuka" };
}
