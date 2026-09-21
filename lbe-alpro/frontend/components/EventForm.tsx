"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CATEGORY_META, EVENT_TYPE_META } from "@/lib/constants";
import type {
  CreateEventRequest,
  EventCategory,
  EventType,
} from "@/lib/types";

export interface EventFormValues {
  title: string;
  category: EventCategory;
  type: EventType;
  description: string;
  posterUrl: string;
  quota: string;
  deadline: string;
  startDate: string;
  endDate: string;
}

interface EventFormProps {
  initial?: Partial<EventFormValues>;
  requireFutureDeadline?: boolean;
  pending: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (values: CreateEventRequest) => void;
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventForm({
  initial = {},
  requireFutureDeadline = false,
  pending,
  error,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>({
    title: initial.title ?? "",
    category: initial.category ?? "keilmiahan",
    type: initial.type ?? "lomba",
    description: initial.description ?? "",
    posterUrl: initial.posterUrl ?? "",
    quota: initial.quota ?? "",
    deadline: initial.deadline ?? "",
    startDate: initial.startDate ?? "",
    endDate: initial.endDate ?? "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!values.title.trim()) {
      setValidationError("Judul event wajib diisi.");
      return;
    }
    const quota = Number(values.quota);
    if (!Number.isInteger(quota) || quota <= 0) {
      setValidationError("Kuota harus bilangan bulat di atas 0.");
      return;
    }
    const deadline = new Date(values.deadline);
    if (Number.isNaN(deadline.getTime())) {
      setValidationError("Tenggat waktu tidak valid.");
      return;
    }
    if (requireFutureDeadline && deadline.getTime() <= Date.now()) {
      setValidationError("Tenggat waktu harus di masa depan.");
      return;
    }
    setValidationError(null);
    onSubmit({
      title: values.title.trim(),
      category: values.category,
      type: values.type,
      description: values.description,
      ...(values.posterUrl.trim() ? { posterUrl: values.posterUrl.trim() } : {}),
      quota,
      deadline: deadline.toISOString(),
      ...(values.startDate ? { startDate: new Date(values.startDate).toISOString() } : {}),
      ...(values.endDate ? { endDate: new Date(values.endDate).toISOString() } : {}),
    });
  }

  const shownError = validationError ?? error;
  const inputClass =
    "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {shownError ? (
        <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {shownError}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="event-title" className="text-sm text-[var(--faint)]">
          Judul
        </label>
        <input
          id="event-title"
          type="text"
          required
          className={inputClass}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="event-category" className="text-sm text-[var(--faint)]">
            Bidang
          </label>
          <select
            id="event-category"
            className={inputClass}
            value={values.category}
            onChange={(e) => set("category", e.target.value as EventCategory)}
          >
            {(
              Object.entries(CATEGORY_META) as [EventCategory, { label: string }][]
            ).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="event-type" className="text-sm text-[var(--faint)]">
            Tipe
          </label>
          <select
            id="event-type"
            className={inputClass}
            value={values.type}
            onChange={(e) => set("type", e.target.value as EventType)}
          >
            {(
              Object.entries(EVENT_TYPE_META) as [EventType, { label: string }][]
            ).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="event-description" className="text-sm text-[var(--faint)]">
          Deskripsi
        </label>
        <textarea
          id="event-description"
          rows={4}
          className={inputClass}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="event-poster" className="text-sm text-[var(--faint)]">
          URL poster (opsional)
        </label>
        <input
          id="event-poster"
          type="url"
          placeholder="https://…"
          className={inputClass}
          value={values.posterUrl}
          onChange={(e) => set("posterUrl", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="event-quota" className="text-sm text-[var(--faint)]">
            Kuota
          </label>
          <input
            id="event-quota"
            type="number"
            min={1}
            step={1}
            required
            className={inputClass}
            value={values.quota}
            onChange={(e) => set("quota", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="event-deadline" className="text-sm text-[var(--faint)]">
            Tenggat pendaftaran
          </label>
          <input
            id="event-deadline"
            type="datetime-local"
            required
            className={inputClass}
            value={values.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="event-start" className="text-sm text-[var(--faint)]">
            Mulai (opsional)
          </label>
          <input
            id="event-start"
            type="datetime-local"
            className={inputClass}
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="event-end" className="text-sm text-[var(--faint)]">
          Selesai (opsional)
        </label>
        <input
          id="event-end"
          type="datetime-local"
          className={inputClass}
          value={values.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function eventToFormValues(event: {
  title: string;
  category: EventCategory;
  type: EventType;
  description: string;
  posterUrl: string | null;
  quota: number;
  deadline: string;
  startDate: string | null;
  endDate: string | null;
}): Partial<EventFormValues> {
  return {
    title: event.title,
    category: event.category,
    type: event.type,
    description: event.description,
    posterUrl: event.posterUrl ?? "",
    quota: String(event.quota),
    deadline: toLocalInput(event.deadline),
    startDate: event.startDate ? toLocalInput(event.startDate) : "",
    endDate: event.endDate ? toLocalInput(event.endDate) : "",
  };
}
