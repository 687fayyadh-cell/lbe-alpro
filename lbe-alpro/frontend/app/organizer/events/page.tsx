"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import OrganizerEventTable from "@/components/OrganizerEventTable";
import RequireRole from "@/components/RequireRole";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthErrorRedirect } from "@/hooks/useAuth";
import { getOrganizerEvents } from "@/lib/api";
import { ApiError } from "@/lib/types";
import type { Event } from "@/lib/types";

type ListState =
  | { status: "loading" }
  | { status: "success"; events: Event[] }
  | { status: "error"; message: string };

function OrganizerEventsContent() {
  const router = useRouter();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getOrganizerEvents()
      .then((res) => {
        if (cancelled) return;
        setState({ status: "success", events: res.data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, "/organizer/events")) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Gagal memuat event Anda.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [redirectOnUnauthorized, reloadKey]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Event Saya</h1>
          <p className="mt-1 text-sm text-[var(--faint)]">
            Kelola event yang Anda selenggarakan.
          </p>
        </div>
        <Link
          href="/organizer/events/new"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Buat Event
        </Link>
      </div>
      {state.status === "loading" ? (
        <div className="rounded-lg border border-[var(--border)] p-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-2/3" />
        </div>
      ) : state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.events.length === 0 ? (
        <EmptyState
          title="Belum ada event"
          description="Buat event pertama Anda untuk mulai menerima pendaftar."
          actionLabel="Buat Event"
          onAction={() => router.push("/organizer/events/new")}
        />
      ) : (
        <OrganizerEventTable events={state.events} />
      )}
    </main>
  );
}

export default function OrganizerEventsPage() {
  return (
    <RequireRole access="organizer">
      <OrganizerEventsContent />
    </RequireRole>
  );
}
