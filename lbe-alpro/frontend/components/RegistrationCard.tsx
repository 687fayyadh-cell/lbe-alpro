import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { formatDateWib, formatDeadlineWib } from "@/lib/format";
import {
  CATEGORY_META,
  EVENT_TYPE_META,
  REGISTRATION_STATUS_META,
} from "@/lib/constants";
import type { Event, Registration } from "@/lib/types";

interface RegistrationCardProps {
  registration: Registration;
  event: Event | null;
}

export default function RegistrationCard({
  registration,
  event,
}: RegistrationCardProps) {
  const status = REGISTRATION_STATUS_META[registration.status];
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        {event ? (
          <>
            <StatusBadge
              label={CATEGORY_META[event.category].label}
              tone={CATEGORY_META[event.category].tone}
            />
            <StatusBadge
              label={EVENT_TYPE_META[event.type].label}
              tone={EVENT_TYPE_META[event.type].tone}
            />
          </>
        ) : null}
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
      {event ? (
        <Link href={`/events/${event.id}`}>
          <h2 className="mt-3 text-base font-semibold hover:underline">
            {event.title}
          </h2>
        </Link>
      ) : (
        <h2 className="mt-3 text-base font-semibold">
          Event #{registration.eventId}
        </h2>
      )}
      <dl className="mt-2 grid gap-1 text-sm text-[var(--faint)]">
        <div className="flex gap-2">
          <dt>Terdaftar:</dt>
          <dd>{formatDateWib(registration.registeredAt)}</dd>
        </div>
        {event ? (
          <div className="flex gap-2">
            <dt>Batas daftar:</dt>
            <dd>{formatDeadlineWib(event.deadline)}</dd>
          </div>
        ) : null}
      </dl>
      {event ? (
        <Link
          href={`/events/${event.id}`}
          className="mt-3 inline-block text-sm underline"
        >
          Lihat detail event
        </Link>
      ) : null}
    </article>
  );
}
