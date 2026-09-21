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

/**
 * Single reusable error-message map (FE-09). Components must use
 * friendlyErrorMessage() instead of scattering per-code copy.
 */
export const ERROR_MESSAGE_MAP: Record<string, string> = {
  EVENT_QUOTA_FULL: "Maaf, kuota pendaftaran untuk event ini sudah penuh.",
  EVENT_DEADLINE_PASSED:
    "Pendaftaran event ini sudah ditutup karena melewati tenggat waktu.",
  ALREADY_REGISTERED: "Kamu sudah terdaftar pada event ini.",
  EVENT_NOT_PUBLISHED: "Event belum dibuka untuk pendaftaran.",
  EMAIL_TAKEN: "Email sudah terdaftar.",
  VALIDATION_ERROR: "Data yang dikirim belum valid. Periksa kembali isian.",
  UNAUTHORIZED: "Sesi berakhir. Silakan masuk ulang.",
  FORBIDDEN: "Akun Anda tidak memiliki akses untuk aksi ini.",
  NOT_FOUND: "Data tidak ditemukan.",
  INTERNAL_ERROR: "Terjadi kesalahan pada server. Silakan coba lagi.",
};

export function friendlyErrorMessage(code: string, fallback: string): string {
  return ERROR_MESSAGE_MAP[code] ?? fallback;
}
