import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { formatDeadlineWib } from "@/lib/format";
import {
  CATEGORY_META,
  EVENT_STATUS_META,
  EVENT_TYPE_META,
} from "@/lib/constants";
import type { Event } from "@/lib/types";

interface OrganizerEventTableProps {
  events: Event[];
}

export default function OrganizerEventTable({
  events,
}: OrganizerEventTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full min-w-3xl text-left text-sm">
        <thead className="sticky top-0 bg-[var(--surface)]">
          <tr className="border-b border-[var(--border)]">
            <th scope="col" className="px-4 py-3 font-medium">
              Event
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Kategori / Tipe
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Kuota
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Tenggat
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className="px-4 py-3 font-medium">{event.title}</td>
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
              <td className="px-4 py-3">
                <StatusBadge
                  label={EVENT_STATUS_META[event.status].label}
                  tone={EVENT_STATUS_META[event.status].tone}
                />
              </td>
              <td className="px-4 py-3 text-[var(--faint)]">
                {event.currentParticipants}/{event.quota}
              </td>
              <td className="px-4 py-3 text-[var(--faint)]">
                {formatDeadlineWib(event.deadline)}
              </td>
              <td className="px-4 py-3">
                <span className="flex gap-3">
                  <Link
                    href={`/events/${event.id}`}
                    className="underline"
                  >
                    Lihat
                  </Link>
                  <Link
                    href={`/organizer/events/${event.id}/edit`}
                    className="underline"
                  >
                    Ubah
                  </Link>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
