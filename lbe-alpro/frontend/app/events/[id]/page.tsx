"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ErrorState from "@/components/ui/ErrorState";
import EventDetail from "@/components/EventDetail";
import RegisterEventModal from "@/components/RegisterEventModal";
import NotFoundState from "@/components/ui/NotFoundState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth, useAuthErrorRedirect } from "@/hooks/useAuth";
import { getEventById } from "@/lib/api";
import { availabilityOf } from "@/lib/format";
import { ApiError } from "@/lib/types";
import type { Event } from "@/lib/types";

type DetailState =
  | { status: "loading" }
  | { status: "success"; event: Event }
  | { status: "not-found" }
  | { status: "error"; message: string };

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const rawId = params.id;
  const eventId = Number(rawId);
  const idValid = Number.isInteger(eventId) && eventId > 0;
  const [state, setState] = useState<DetailState>(() =>
    idValid ? { status: "loading" } : { status: "not-found" },
  );
  const [trackedId, setTrackedId] = useState(rawId);
  const [reloadKey, setReloadKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  if (trackedId !== rawId) {
    setTrackedId(rawId);
    setJustRegistered(false);
    const nextId = Number(rawId);
    setState(
      Number.isInteger(nextId) && nextId > 0
        ? { status: "loading" }
        : { status: "not-found" },
    );
  }

  useEffect(() => {
    if (!idValid) return;
    let cancelled = false;
    getEventById(eventId)
      .then((event) => {
        if (cancelled) return;
        setState({ status: "success", event });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, `/events/${rawId}`)) return;
        if (err instanceof ApiError && err.code === "NOT_FOUND") {
          setState({ status: "not-found" });
          return;
        }
        setState({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Gagal memuat event. Silakan coba lagi.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, idValid, rawId, redirectOnUnauthorized, reloadKey]);

  function renderAction(event: Event) {
    if (authLoading) {
      return <Skeleton className="h-10 w-40" />;
    }
    if (!user) {
      return (
        <Link
          href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}
          className="inline-block rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Daftar Sekarang
        </Link>
      );
    }
    if (user.role !== "student") {
      return (
        <div>
          <button
            type="button"
            disabled
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Daftar Sekarang
          </button>
          <p className="mt-2 text-sm text-[var(--faint)]">
            Hanya mahasiswa yang dapat mendaftar event.
          </p>
        </div>
      );
    }
    const availability = availabilityOf(event);
    if (availability.key !== "open") {
      return (
        <div>
          <button
            type="button"
            disabled
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Daftar Sekarang
          </button>
          <p className="mt-2 text-sm text-[var(--faint)]">
            {availability.key === "full"
              ? "Kuota pendaftaran sudah penuh."
              : "Pendaftaran sudah ditutup."}
          </p>
        </div>
      );
    }
    if (justRegistered) {
      return (
        <button
          type="button"
          disabled
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Terdaftar
        </button>
      );
    }
    return (
      <div>
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Daftar Sekarang
        </button>
        {registerOpen ? (
          <RegisterEventModal
            event={event}
            open={registerOpen}
            onClose={() => setRegisterOpen(false)}
            onSuccess={() => {
              setJustRegistered(true);
              setReloadKey((k) => k + 1);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      {state.status === "loading" ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="mt-4 h-7 w-2/3" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      ) : state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.status === "not-found" ? (
        <NotFoundState
          title="Event tidak ditemukan"
          description="Event mungkin sudah dihapus atau tautan salah."
          actionLabel="Kembali ke Jelajah"
          onAction={() => {
            router.push("/");
          }}
        />
      ) : (
        <>
          {justRegistered ? (
            <p
              role="status"
              className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
            >
              Pendaftaran berhasil. Status Anda: Menunggu.
            </p>
          ) : null}
          <EventDetail event={state.event} action={renderAction(state.event)} />
        </>
      )}
    </main>
  );
}
