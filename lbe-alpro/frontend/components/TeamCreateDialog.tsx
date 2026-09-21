"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Modal from "./Modal";
import { createTeam, getEvents } from "@/lib/api";
import { friendlyErrorMessage } from "@/lib/constants";
import { ApiError } from "@/lib/types";
import type { Event, Team } from "@/lib/types";

interface TeamCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (team: Team) => void;
}

export default function TeamCreateDialog({
  open,
  onClose,
  onCreated,
}: TeamCreateDialogProps) {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open || events !== null) return;
    let cancelled = false;
    getEvents({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setEvents(res.data);
        if (res.data.length > 0) setEventId(String(res.data[0].id));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Gagal memuat daftar event.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [open, events]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const parsedEventId = Number(eventId);
    if (!Number.isInteger(parsedEventId) || parsedEventId <= 0) {
      setError("Pilih event terkait.");
      return;
    }
    if (!title.trim() || !description.trim() || !contactInfo.trim()) {
      setError("Judul, deskripsi, dan kontak wajib diisi.");
      return;
    }
    const parsedMax = maxMembers.trim() === "" ? null : Number(maxMembers);
    if (parsedMax !== null && (!Number.isInteger(parsedMax) || parsedMax < 2)) {
      setError("Kapasitas minimal 2 anggota.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const team = await createTeam({
        eventId: parsedEventId,
        title: title.trim(),
        description: description.trim(),
        contactInfo: contactInfo.trim(),
        ...(parsedMax !== null ? { maxMembers: parsedMax } : {}),
      });
      onCreated(team);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal membuat post.",
      );
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat post Cari Tim"
      description="Cari anggota tim untuk lomba atau funmatch."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error ? (
          <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="team-event" className="text-sm text-[var(--faint)]">
            Event terkait
          </label>
          <select
            id="team-event"
            className={inputClass}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-title" className="text-sm text-[var(--faint)]">
            Judul
          </label>
          <input
            id="team-title"
            type="text"
            required
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-description" className="text-sm text-[var(--faint)]">
            Deskripsi kebutuhan tim
          </label>
          <textarea
            id="team-description"
            rows={3}
            required
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-contact" className="text-sm text-[var(--faint)]">
            Kontak
          </label>
          <input
            id="team-contact"
            type="text"
            required
            placeholder="@username / nomor WA"
            className={inputClass}
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="team-max" className="text-sm text-[var(--faint)]">
            Kapasitas maks (opsional)
          </label>
          <input
            id="team-max"
            type="number"
            min={2}
            step={1}
            className={inputClass}
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
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
            {pending ? "Menyimpan…" : "Buat Post"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
