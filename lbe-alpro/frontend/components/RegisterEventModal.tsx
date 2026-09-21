"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "./Modal";
import { friendlyErrorMessage } from "@/lib/constants";
import { registerToEvent } from "@/lib/api";
import { ApiError } from "@/lib/types";
import type { Event, Registration } from "@/lib/types";

interface RegisterEventModalProps {
  event: Event;
  open: boolean;
  onClose: () => void;
  onSuccess: (registration: Registration) => void;
}

export default function RegisterEventModal({
  event,
  open,
  onClose,
  onSuccess,
}: RegisterEventModalProps) {
  const [answer, setAnswer] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const url = attachmentUrl.trim();
    if (url && !/^https?:\/\/.+/.test(url)) {
      setError("Tautan berkas harus berupa URL http(s) yang valid.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const registration = await registerToEvent(event.id, {
        ...(answer.trim() ? { answer: answer.trim() } : {}),
        ...(url ? { attachmentUrl: url } : {}),
      });
      onSuccess(registration);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal mendaftar. Silakan coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Daftar: ${event.title}`}
      description="Konfirmasi pendaftaran Anda untuk event ini."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error ? (
          <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <p>{error}</p>
            {error === friendlyErrorMessage("UNAUTHORIZED", "") ? (
              <Link href="/login" className="mt-1 inline-block underline">
                Masuk ulang
              </Link>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="register-answer" className="text-sm text-[var(--faint)]">
            Jawaban singkat (opsional)
          </label>
          <textarea
            id="register-answer"
            rows={3}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-attachment" className="text-sm text-[var(--faint)]">
            Tautan berkas (opsional)
          </label>
          <input
            id="register-attachment"
            type="url"
            placeholder="https://…"
            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Mendaftar…" : "Konfirmasi Daftar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
