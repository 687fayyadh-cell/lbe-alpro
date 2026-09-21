"use client";

import { useParams, useRouter } from "next/navigation";
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
  getEventById,
  getEventRegistrants,
  updateRegistrationStatus,
} from "@/lib/api";
import { friendlyErrorMessage, REGISTRATION_STATUS_META } from "@/lib/constants";
import { formatDateWib } from "@/lib/format";
import { ApiError } from "@/lib/types";
import type {
  Event,
  Registrant,
  RegistrationStatus,
} from "@/lib/types";

type PageState =
  | { status: "loading" }
  | { status: "success"; event: Event; rows: Registrant[] }
  | { status: "error"; message: string };

type PendingAction = {
  id: number;
  status: Extract<RegistrationStatus, "approved" | "rejected">;
  label: string;
} | null;

function RegistrantsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const { notify } = useToast();
  const eventId = Number(params.id);
  const idValid = Number.isInteger(eventId) && eventId > 0;
  const [state, setState] = useState<PageState>(() =>
    idValid
      ? { status: "loading" }
      : { status: "error", message: "ID event tidak valid." },
  );
  const [trackedId, setTrackedId] = useState(params.id);
  if (trackedId !== params.id) {
    setTrackedId(params.id);
    const nextId = Number(params.id);
    setState(
      Number.isInteger(nextId) && nextId > 0
        ? { status: "loading" }
        : { status: "error", message: "ID event tidak valid." },
    );
  }
  const [reloadKey, setReloadKey] = useState(0);
  const [confirm, setConfirm] = useState<PendingAction>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  useEffect(() => {
    if (!idValid) return;
    let cancelled = false;
    Promise.all([getEventById(eventId), getEventRegistrants(eventId)])
      .then(([event, res]) => {
        if (cancelled) return;
        setState({ status: "success", event, rows: res.data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, `/organizer/events/${params.id}/registrants`)) {
          return;
        }
        setState({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Gagal memuat pendaftar.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, idValid, params.id, redirectOnUnauthorized, reloadKey]);

  async function runAction() {
    if (!confirm || actingId !== null || state.status !== "success") return;
    const { id, status } = confirm;
    const previous = state.rows;
    setActingId(id);
    setConfirm(null);
    setState({
      ...state,
      rows: state.rows.map((row) =>
        row.registration.id === id
          ? {
              ...row,
              registration: { ...row.registration, status },
            }
          : row,
      ),
    });
    try {
      await updateRegistrationStatus(id, status);
      notify(
        status === "approved"
          ? "Pendaftar disetujui."
          : "Pendaftar ditolak.",
      );
    } catch (err) {
      setState({ ...state, rows: previous });
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
      <div>
        <h1 className="text-2xl font-semibold">Pendaftar Event</h1>
        {state.status === "success" ? (
          <p className="mt-1 text-sm text-[var(--faint)]">{state.event.title}</p>
        ) : null}
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
      ) : state.rows.length === 0 ? (
        <EmptyState
          title="Belum ada pendaftar"
          description="Bagikan event agar mahasiswa mulai mendaftar."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="sticky top-0 bg-[var(--surface)]">
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Jawaban / Berkas</th>
                <th scope="col" className="px-4 py-3 font-medium">Waktu daftar</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => {
                const meta = REGISTRATION_STATUS_META[row.registration.status];
                const busy = actingId === row.registration.id;
                return (
                  <tr
                    key={row.registration.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {row.user ? row.user.name : `Pengguna #${row.registration.userId}`}
                    </td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      {row.user ? row.user.email : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      {row.registration.answer
                        ? row.registration.answer
                        : row.registration.attachmentUrl
                          ? (
                            <a
                              href={row.registration.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Lihat berkas
                            </a>
                          )
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--faint)]">
                      {formatDateWib(row.registration.registeredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </td>
                    <td className="px-4 py-3">
                      {row.registration.status === "pending" ? (
                        <span className="flex gap-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                id: row.registration.id,
                                status: "approved",
                                label: row.user
                                  ? row.user.name
                                  : `Pengguna #${row.registration.userId}`,
                              })
                            }
                            className="py-1 underline disabled:opacity-40"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                id: row.registration.id,
                                status: "rejected",
                                label: row.user
                                  ? row.user.name
                                  : `Pengguna #${row.registration.userId}`,
                              })
                            }
                            className="py-1 underline disabled:opacity-40"
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
        title={
          confirm?.status === "approved"
            ? `Setujui ${confirm?.label ?? ""}?`
            : `Tolak ${confirm?.label ?? ""}?`
        }
        description={
          confirm?.status === "approved"
            ? "Pendaftar akan ditandai diterima."
            : "Pendaftar akan ditandai ditolak. Aksi ini tercatat."
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
      {state.status === "success" ? (
        <button
          type="button"
          onClick={() => router.push("/organizer/events")}
          className="self-start text-sm underline"
        >
          Kembali ke Event Saya
        </button>
      ) : null}
    </main>
  );
}

export default function RegistrantsPage() {
  return (
    <RequireRole access="organizer">
      <RegistrantsContent />
    </RequireRole>
  );
}
