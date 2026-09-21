"use client";

import { useEffect, useState } from "react";
import {
  AVAILABILITY_META,
  CATEGORY_META,
  EVENT_TYPE_META,
} from "@/lib/constants";
import type {
  EventAvailability,
  EventCategory,
  EventType,
} from "@/lib/types";

export interface FilterValues {
  category: EventCategory | "";
  type: EventType | "";
  status: EventAvailability | "";
  query: string;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export default function FilterBar({ values, onChange }: FilterBarProps) {
  const [query, setQuery] = useState(values.query);
  const [syncedQuery, setSyncedQuery] = useState(values.query);
  if (syncedQuery !== values.query) {
    setSyncedQuery(values.query);
    setQuery(values.query);
  }

  useEffect(() => {
    if (query === values.query) return;
    const timer = setTimeout(() => {
      onChange({ ...values, query });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-category" className="text-sm text-[var(--faint)]">
          Bidang
        </label>
        <select
          id="filter-category"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={values.category}
          onChange={(e) =>
            onChange({
              ...values,
              category: (e.target.value || "") as EventCategory | "",
            })
          }
        >
          <option value="">Semua bidang</option>
          {(
            Object.entries(CATEGORY_META) as [
              EventCategory,
              { label: string },
            ][]
          ).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-type" className="text-sm text-[var(--faint)]">
          Tipe
        </label>
        <select
          id="filter-type"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={values.type}
          onChange={(e) =>
            onChange({
              ...values,
              type: (e.target.value || "") as EventType | "",
            })
          }
        >
          <option value="">Semua tipe</option>
          {(
            Object.entries(EVENT_TYPE_META) as [EventType, { label: string }][]
          ).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-status" className="text-sm text-[var(--faint)]">
          Status
        </label>
        <select
          id="filter-status"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={values.status}
          onChange={(e) =>
            onChange({
              ...values,
              status: (e.target.value || "") as EventAvailability | "",
            })
          }
        >
          <option value="">Semua status</option>
          {(
            Object.entries(AVAILABILITY_META) as [
              EventAvailability,
              { label: string },
            ][]
          ).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-q" className="text-sm text-[var(--faint)]">
          Kata kunci
        </label>
        <input
          id="filter-q"
          type="search"
          placeholder="Cari event…"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
