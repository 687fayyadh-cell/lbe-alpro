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
      <FilterBar values={url} onChange={onFiltersChange} />
      {state.status === "error" ? (
        <ErrorState
          message={state.error ?? "Gagal memuat event."}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <EventCardSkeleton key={key} />
          ))}
        </div>
      ) : state.events.length === 0 ? (
        <EmptyState
          title="Tidak ada event ditemukan"
          description="Coba ubah filter atau kata kunci pencarian."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
