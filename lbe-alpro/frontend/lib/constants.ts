// SinergiITS enum display metadata (G0 freeze).
// API slugs (lib/types.ts) are source of truth; components must import
// labels/colors from here, never hardcode category/type/status strings.

import type {
  EventAvailability,
  EventCategory,
  EventStatus,
  EventType,
  RegistrationStatus,
  Role,
} from "./types";

export interface EnumMeta {
  label: string;
  /** CSS var token name, e.g. "category-minat-bakat". */
  tone: string;
}

export const ROLE_META: Record<Role, EnumMeta> = {
  student: { label: "Mahasiswa", tone: "role-student" },
  organizer: { label: "Penyelenggara", tone: "role-organizer" },
  admin: { label: "Admin", tone: "role-admin" },
};

export const CATEGORY_META: Record<EventCategory, EnumMeta> = {
  minat_bakat: { label: "Minat Bakat", tone: "category-minat-bakat" },
  kewirausahaan: { label: "Kewirausahaan", tone: "category-kewirausahaan" },
  manajerial: { label: "Manajerial", tone: "category-manajerial" },
  keilmiahan: { label: "Keilmiahan", tone: "category-keilmiahan" },
};

export const EVENT_TYPE_META: Record<EventType, EnumMeta> = {
  lomba: { label: "Lomba", tone: "type-lomba" },
  bootcamp: { label: "Bootcamp", tone: "type-bootcamp" },
  oprec: { label: "Oprec", tone: "type-oprec" },
  workshop: { label: "Workshop", tone: "type-workshop" },
  funmatch: { label: "Funmatch", tone: "type-funmatch" },
  bazar: { label: "Bazar", tone: "type-bazar" },
  riset: { label: "Riset", tone: "type-riset" },
};

export const EVENT_STATUS_META: Record<EventStatus, EnumMeta> = {
  pending: { label: "Menunggu", tone: "status-pending" },
  published: { label: "Tayang", tone: "status-published" },
  rejected: { label: "Ditolak", tone: "status-rejected" },
};

export const REGISTRATION_STATUS_META: Record<RegistrationStatus, EnumMeta> = {
  pending: { label: "Menunggu", tone: "status-pending" },
  approved: { label: "Diterima", tone: "status-approved" },
  rejected: { label: "Ditolak", tone: "status-rejected" },
};

export const AVAILABILITY_META: Record<EventAvailability, EnumMeta> = {
  open: { label: "Dibuka", tone: "status-open" },
  closed: { label: "Ditutup", tone: "status-closed" },
};

/** Error codes FE-02 must branch on (see docs/api-contract-v1.md). */
export const KNOWN_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "EMAIL_TAKEN",
  "ALREADY_REGISTERED",
  "EVENT_QUOTA_FULL",
  "EVENT_DEADLINE_PASSED",
  "EVENT_NOT_PUBLISHED",
  "INTERNAL_ERROR",
] as const;

export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];
