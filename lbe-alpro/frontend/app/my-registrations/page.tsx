"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import RegistrationCard from "@/components/RegistrationCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth, useAuthErrorRedirect } from "@/hooks/useAuth";
import { getEventById, getMyRegistrations } from "@/lib/api";
import { ApiError } from "@/lib/types";
import type { Event, Registration } from "@/lib/types";

interface LoadedRegistration {
  registration: Registration;
  event: Event | null;
}

type PageState =
  | { status: "loading" }
  | { status: "success"; items: LoadedRegistration[] }
  | { status: "error"; message: string };

export default function MyRegistrationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=%2Fmy-registrations");
      return;
    }
    let cancelled = false;
    getMyRegistrations()
      .then(async (res) => {
        const items = await Promise.all(
          res.data.map(async (registration) => {
            try {
              const event = await getEventById(registration.eventId);
              return { registration, event };
            } catch {
              return { registration, event: null };
            }
          }),
        );
        if (cancelled) return;
        setState({ status: "success", items });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, "/my-registrations")) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Gagal memuat riwayat pendaftaran.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router, redirectOnUnauthorized, reloadKey]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Pendaftaran Saya</h1>
        <p className="mt-1 text-sm text-[var(--faint)]">
          Riwayat event yang Anda ikuti.
        </p>
      </div>
      {state.status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.items.length === 0 ? (
        <EmptyState
          title="Belum ada pendaftaran"
          description="Jelajahi event dan daftar untuk melihat riwayat di sini."
          actionLabel="Jelajah Event"
          onAction={() => router.push("/")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.items.map((item) => (
            <RegistrationCard
              key={item.registration.id}
              registration={item.registration}
              event={item.event}
            />
          ))}
        </div>
      )}
    </main>
  );
}
