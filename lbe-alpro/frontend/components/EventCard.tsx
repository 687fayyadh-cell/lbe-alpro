import Link from "next/link";
import QuotaBar from "./QuotaBar";
import StatusBadge from "./StatusBadge";
import { availabilityOf, formatDeadlineWib } from "@/lib/format";
import { CATEGORY_META, EVENT_TYPE_META } from "@/lib/constants";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const availability = availabilityOf(event);
  const tone =
    availability.key === "open" ? "status-open" : "status-closed";
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      {event.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.posterUrl}
          alt=""
          aria-hidden="true"
          className="mb-3 h-28 w-full rounded-md object-cover"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <StatusBadge
          label={CATEGORY_META[event.category].label}
          tone={CATEGORY_META[event.category].tone}
        />
        <StatusBadge
          label={EVENT_TYPE_META[event.type].label}
          tone={EVENT_TYPE_META[event.type].tone}
        />
        <StatusBadge label={availability.label} tone={tone} />
      </div>
      <Link href={`/events/${event.id}`}>
        <h2 className="mt-3 text-[17px] font-semibold hover:underline">
          {event.title}
        </h2>
      </Link>
      <p className="mt-1 text-sm text-[var(--faint)]">
        Batas daftar: {formatDeadlineWib(event.deadline)}
      </p>
      <div className="mt-3">
        <QuotaBar current={event.currentParticipants} quota={event.quota} />
      </div>
    </article>
  );
}
