"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Modal from "@/components/Modal";
import RequireRole from "@/components/RequireRole";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/StatusBadge";
import { useAuthErrorRedirect } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  getModerationEvents,
  updateModerationStatus,
} from "@/lib/api";
import { friendlyErrorMessage } from "@/lib/constants";
import { formatDateWib, formatDeadlineWib } from "@/lib/format";
import {
  CATEGORY_META,
  EVENT_STATUS_META,
  EVENT_TYPE_META,
} from "@/lib/constants";
import { ApiError } from "@/lib/types";
import type { Event, EventStatus } from "@/lib/types";

type QueueState =
  | { status: "loading" }
  | { status: "success"; events: Event[] }
  | { status: "error"; message: string };

type PendingAction = {
  id: number;
  status: Extract<EventStatus, "published" | "rejected">;
} | null;

const STATUS_FILTERS: { value: EventStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "published", label: "Tayang" },
  { value: "rejected", label: "Ditolak" },
];

function ModerationContent() {
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const { notify } = useToast();
  const [filter, setFilter] = useState<EventStatus>("pending");
  const [state, setState] = useState<QueueState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [confirm, setConfirm] = useState<PendingAction>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getModerationEvents(filter)
      .then((res) => {
        if (cancelled) return;
        setState({ status: "success", events: res.data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, "/admin/moderation")) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Gagal memuat antrean.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [filter, redirectOnUnauthorized, reloadKey]);

  async function runAction() {
    if (!confirm || actingId !== null || state.status !== "success") return;
    const { id, status } = confirm;
    const previous = state.events;
    setActingId(id);
    setConfirm(null);
    setState({
      ...state,
      events: state.events.map((event) =>
        event.id === id ? { ...event, status } : event,
      ),
    });
    try {
      await updateModerationStatus(id, status);
      notify(
        status === "published" ? "Event disetujui dan tayang." : "Event ditolak.",
      );
    } catch (err) {
      setState({ ...state, events: previous });
      notify(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal memperbarui status.",
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Moderasi Event</h1>
          <p className="mt-1 text-sm text-[var(--faint)]">
            Setujui event agar tayang publik.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="moderation-filter" className="text-sm text-[var(--faint)]">
            Status
          </label>
          <select
            id="moderation-filter"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as EventStatus)}
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
          title="Antrean kosong"
          description="Tidak ada event dengan status ini."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="sticky top-0 bg-[var(--surface)]">
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-medium">Judul</th>
                <th scope="col" className="px-4 py-3 font-medium">Penyelenggara</th>
                <th scope="col" className="px-4 py-3 font-medium">Kategori / Tipe</th>
                <th scope="col" className="px-4 py-3 font-medium">Tenggat</th>
                <th scope="col" className="px-4 py-3 font-medium">Dibuat</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.events.map((event) => {
                const busy = actingId === event.id;
                return (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{event.title}</td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      Penyelenggara #{event.organizerId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        <StatusBadge
                          label={CATEGORY_META[event.category].label}
                          tone={CATEGORY_META[event.category].tone}
                        />
                        <StatusBadge
                          label={EVENT_TYPE_META[event.type].label}
                          tone={EVENT_TYPE_META[event.type].tone}
                        />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      {formatDeadlineWib(event.deadline)}
                    </td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      {formatDateWib(event.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={EVENT_STATUS_META[event.status].label}
                        tone={EVENT_STATUS_META[event.status].tone}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {event.status === "pending" ? (
                        <span className="flex gap-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({ id: event.id, status: "published" })
                            }
                            className="underline disabled:opacity-40"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({ id: event.id, status: "rejected" })
                            }
                            className="underline disabled:opacity-40"
                          >
                            Tolak
                          </button>
                        </span>
                      ) : (
                        <span className="text-[var(--faint)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.status === "published" ? "Setujui event?" : "Tolak event?"}
        description={
          confirm?.status === "published"
            ? "Event akan tayang publik."
            : "Event tidak akan tayang publik."
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirm(null)}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void runAction()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              Konfirmasi
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--faint)]">
          Pastikan keputusan sudah benar sebelum dilanjutkan.
        </p>
      </Modal>
    </main>
  );
}

export default function ModerationPage() {
  return (
    <RequireRole access="admin">
      <ModerationContent />
    </RequireRole>
  );
}
