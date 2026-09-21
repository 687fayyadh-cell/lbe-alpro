"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import EventForm from "@/components/EventForm";
import RequireRole from "@/components/RequireRole";
import { createEvent } from "@/lib/api";
import { friendlyErrorMessage } from "@/lib/constants";
import { setFlash } from "@/lib/flash";
import { ApiError } from "@/lib/types";
import type { CreateEventRequest } from "@/lib/types";

function NewEventContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: CreateEventRequest) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await createEvent(values);
      setFlash("Event berhasil dibuat dan menunggu persetujuan admin.");
      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setError(
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
      <h1 className="text-2xl font-semibold">Buat Event</h1>
      <p className="mt-1 text-sm text-[var(--faint)]">
        Event baru berstatus menunggu dan tampil setelah disetujui admin.
      </p>
      <div className="mt-6">
        <EventForm
          requireFutureDeadline
          pending={pending}
          error={error}
          submitLabel="Buat Event"
          onSubmit={(values) => void handleSubmit(values)}
        />
      </div>
    </main>
  );
}

export default function NewOrganizerEventPage() {
  return (
    <RequireRole access="organizer">
      <NewEventContent />
    </RequireRole>
  );
}
