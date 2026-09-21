"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import EventCard from "@/components/EventCard";
import FilterBar from "@/components/FilterBar";
import type { FilterValues } from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import {
  AVAILABILITY_META,
  CATEGORY_META,
  EVENT_TYPE_META,
} from "@/lib/constants";
import { getEvents } from "@/lib/api";
import { useAuthErrorRedirect } from "@/hooks/useAuth";
import { ApiError } from "@/lib/types";
import type {
  Event,
  EventAvailability,
  EventCategory,
  EventType,
  PaginationMeta,
} from "@/lib/types";

const DEFAULT_LIMIT = 10;

function asSlug<T extends string>(raw: string | null, keys: string[]): T | "" {
  if (!raw) return "";
  return (keys.includes(raw) ? raw : "") as T | "";
}

interface UrlState extends FilterValues {
  page: number;
}

function parseUrl(searchParams: URLSearchParams): UrlState {
  const page = Number(searchParams.get("page") ?? "1");
  return {
    category: asSlug<EventCategory>(
      searchParams.get("category"),
      Object.keys(CATEGORY_META),
    ),
    type: asSlug<EventType>(
      searchParams.get("type"),
      Object.keys(EVENT_TYPE_META),
    ),
    status: asSlug<EventAvailability>(
      searchParams.get("status"),
      Object.keys(AVAILABILITY_META),
    ),
    query: searchParams.get("q") ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

interface ExploreState {
  status: "loading" | "success" | "error";
  events: Event[];
  meta: PaginationMeta | null;
  error: string | null;
}

const INITIAL_STATE: ExploreState = {
  status: "loading",
  events: [],
  meta: null,
  error: null,
};

function ExploreContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const [state, setState] = useState<ExploreState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  const url = useMemo(
    () => parseUrl(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [
    url.category,
    url.type,
    url.status,
    url.query,
  ].filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;
    getEvents({
      ...(url.category ? { category: url.category } : {}),
      ...(url.type ? { type: url.type } : {}),
      ...(url.status ? { status: url.status } : {}),
      ...(url.query ? { q: url.query } : {}),
      page: url.page,
      limit: DEFAULT_LIMIT,
    })
      .then((res) => {
        if (cancelled) return;
        setState({ status: "success", events: res.data, meta: res.meta, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const query = searchParams.toString();
        if (
          redirectOnUnauthorized(err, query ? `${pathname}?${query}` : pathname)
        ) {
          return;
        }
        setState({
          status: "error",
          events: [],
          meta: null,
          error:
            err instanceof ApiError
              ? err.message
              : "Gagal memuat event. Silakan coba lagi.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [url, pathname, searchParams, redirectOnUnauthorized, reloadKey]);

  function pushUrl(next: UrlState) {
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    if (next.type) params.set("type", next.type);
    if (next.status) params.set("status", next.status);
    if (next.query) params.set("q", next.query);
    params.set("page", String(next.page));
    params.set("limit", String(DEFAULT_LIMIT));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function onFiltersChange(values: FilterValues) {
    pushUrl({ ...values, page: 1 });
  }

  function resetFilters() {
    pushUrl({ category: "", type: "", status: "", query: "", page: 1 });
  }

  function onPageChange(page: number) {
    pushUrl({ ...url, page });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Jelajah Event</h1>
        <p className="mt-1 text-sm text-[var(--faint)]">
          Semua peluang pengembangan diri ITS dalam satu pintu.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside
          aria-label="Filter event"
          className="w-full shrink-0 lg:sticky lg:top-4 lg:w-60"
        >
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold lg:hidden"
          >
            <span>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
            <span aria-hidden="true">{filtersOpen ? "▾" : "▸"}</span>
          </button>
          <h2 className="mb-3 hidden text-sm font-semibold text-[var(--faint)] lg:block">
            Filter
          </h2>
          <div className={`${filtersOpen ? "block" : "hidden"} mt-3 lg:mt-0 lg:block`}>
            <FilterBar values={url} onChange={onFiltersChange} />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
      {state.status === "error" ? (
        <ErrorState
          message={state.error ?? "Gagal memuat event."}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <EventCardSkeleton key={key} />
          ))}
        </div>
      ) : state.events.length === 0 ? (
        <EmptyState
          title="Tidak ada event ditemukan"
          description="Coba ubah filter atau kata kunci pencarian."
          actionLabel="Atur ulang filter"
          onAction={resetFilters}
        />
      ) : (
        <>
          {state.meta ? (
            <p role="status" className="text-sm text-[var(--faint)]">
              {state.meta.total} event ditemukan
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {state.meta ? (
            <Pagination
              page={state.meta.page}
              limit={state.meta.limit}
              total={state.meta.total}
              onPageChange={onPageChange}
            />
          ) : null}
        </>
      )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
