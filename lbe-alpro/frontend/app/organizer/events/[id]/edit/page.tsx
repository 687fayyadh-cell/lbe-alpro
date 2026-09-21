"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventForm, { eventToFormValues } from "@/components/EventForm";
import type { EventFormValues } from "@/components/EventForm";
import ErrorState from "@/components/ui/ErrorState";
import NotFoundState from "@/components/ui/NotFoundState";
import RequireRole from "@/components/RequireRole";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth, useAuthErrorRedirect } from "@/hooks/useAuth";
import { getEventById, updateEvent } from "@/lib/api";
import { friendlyErrorMessage } from "@/lib/constants";
import { setFlash } from "@/lib/flash";
import { ApiError } from "@/lib/types";
import type { CreateEventRequest } from "@/lib/types";

type EditState =
  | { status: "loading" }
  | { status: "ready"; initial: Partial<EventFormValues>; eventId: number }
  | { status: "forbidden" }
  | { status: "not-found" }
  | { status: "error"; message: string };

function EditEventContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const [reloadKey, setReloadKey] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const eventId = Number(params.id);
  const idValid = Number.isInteger(eventId) && eventId > 0;
  const [state, setState] = useState<EditState>(() =>
    idValid ? { status: "loading" } : { status: "not-found" },
  );
  const [trackedId, setTrackedId] = useState(params.id);
  if (trackedId !== params.id) {
    setTrackedId(params.id);
    const nextId = Number(params.id);
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
        if (user && event.organizerId !== user.id && user.role !== "admin") {
          setState({ status: "forbidden" });
          return;
        }
        setState({
          status: "ready",
          initial: eventToFormValues(event),
          eventId: event.id,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, `/organizer/events/${params.id}/edit`)) {
          return;
        }
        if (err instanceof ApiError && err.code === "NOT_FOUND") {
          setState({ status: "not-found" });
          return;
        }
        setState({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Gagal memuat event.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, idValid, params.id, user, redirectOnUnauthorized, reloadKey]);

  async function handleSubmit(values: CreateEventRequest) {
    if (pending || state.status !== "ready") return;
    setPending(true);
    setSaveError(null);
    try {
      await updateEvent(state.eventId, values);
      setFlash("Perubahan event berhasil disimpan.");
      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal menyimpan event.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Ubah Event</h1>
      <div className="mt-6">
        {state.status === "loading" ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-3 h-24 w-full" />
          </>
        ) : state.status === "error" ? (
          <ErrorState
            message={state.message}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : state.status === "not-found" ? (
          <NotFoundState
            title="Event tidak ditemukan"
            actionLabel="Kembali ke Event Saya"
            onAction={() => router.push("/organizer/events")}
          />
        ) : state.status === "forbidden" ? (
          <NotFoundState
            title="Akses ditolak"
            description="Anda bukan pemilik event ini."
            actionLabel="Kembali ke Event Saya"
            onAction={() => router.push("/organizer/events")}
          />
        ) : (
          <EventForm
            initial={state.initial}
            pending={pending}
            error={saveError}
            submitLabel="Simpan Perubahan"
            onSubmit={(values) => void handleSubmit(values)}
          />
        )}
      </div>
    </main>
  );
}

export default function EditOrganizerEventPage() {
  return (
    <RequireRole access="organizer">
      <EditEventContent />
    </RequireRole>
  );
}
