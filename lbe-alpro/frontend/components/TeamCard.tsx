import Link from "next/link";
import type { Event, Team } from "@/lib/types";

interface TeamCardProps {
  team: Team;
  event: Event | null;
  isGuest: boolean;
  isStudent: boolean;
  joining: boolean;
  joined: boolean;
  onJoin: () => void;
}

export default function TeamCard({
  team,
  event,
  isGuest,
  isStudent,
  joining,
  joined,
  onJoin,
}: TeamCardProps) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      {event ? (
        <Link
          href={`/events/${event.id}`}
          className="text-xs text-[var(--faint)] underline"
        >
          {event.title}
        </Link>
      ) : (
        <p className="text-xs text-[var(--faint)]">Event #{team.eventId}</p>
      )}
      <h2 className="mt-1 text-base font-semibold">{team.title}</h2>
      <p className="mt-1 text-sm text-[var(--faint)]">{team.description}</p>
      <dl className="mt-3 grid gap-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-[var(--faint)]">Kontak:</dt>
          <dd>{team.contactInfo}</dd>
        </div>
        {team.maxMembers !== null ? (
          <div className="flex gap-2">
            <dt className="text-[var(--faint)]">Kapasitas:</dt>
            <dd>Maks. {team.maxMembers} anggota</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4">
        {isGuest ? (
          <Link
            href={`/login?next=${encodeURIComponent("/teams")}`}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
          >
            Masuk untuk bergabung
          </Link>
        ) : isStudent ? (
          <button
            type="button"
            disabled={joining || joined}
            onClick={onJoin}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {joined ? "Sudah bergabung" : joining ? "Bergabung…" : "Gabung Tim"}
          </button>
        ) : (
          <p className="text-sm text-[var(--faint)]">
            Hanya mahasiswa yang dapat bergabung.
          </p>
        )}
      </div>
    </article>
  );
}
