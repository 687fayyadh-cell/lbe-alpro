import type { ReactNode } from "react";
import QuotaBar from "./QuotaBar";
import StatusBadge from "./StatusBadge";
import { availabilityOf, formatDeadlineWib } from "@/lib/format";
import { CATEGORY_META, EVENT_STATUS_META, EVENT_TYPE_META } from "@/lib/constants";
import type { Event } from "@/lib/types";

interface EventDetailProps {
  event: Event;
  action: ReactNode;
}

export default function EventDetail({ event, action }: EventDetailProps) {
  const availability = availabilityOf(event);
  const availabilityTone =
    availability.key === "open" ? "status-open" : "status-closed";
  return (
    <article className="flex flex-col gap-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
      {event.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.posterUrl}
          alt={`Poster ${event.title}`}
          className="h-56 w-full rounded-md object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-56 w-full items-center justify-center rounded-md bg-[var(--background)] text-sm text-[var(--faint)]"
        >
          Tanpa poster
        </div>
      )}
      <div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={CATEGORY_META[event.category].label}
            tone={CATEGORY_META[event.category].tone}
          />
          <StatusBadge
            label={EVENT_TYPE_META[event.type].label}
            tone={EVENT_TYPE_META[event.type].tone}
          />
          <StatusBadge
            label={EVENT_STATUS_META[event.status].label}
            tone={EVENT_STATUS_META[event.status].tone}
          />
          <StatusBadge label={availability.label} tone={availabilityTone} />
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{event.title}</h1>
        <p className="mt-1 text-sm text-[var(--faint)]">
          Penyelenggara ID {event.organizerId}
        </p>
      </div>
      <p className="text-sm leading-relaxed">{event.description}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--faint)]">Batas pendaftaran</dt>
          <dd className="mt-0.5 font-medium">
            {formatDeadlineWib(event.deadline)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--faint)]">Kuota</dt>
          <dd className="mt-1">
            <QuotaBar
              current={event.currentParticipants}
              quota={event.quota}
            />
          </dd>
        </div>
      </dl>
      <div>{action}</div>
    </article>
  );
}
