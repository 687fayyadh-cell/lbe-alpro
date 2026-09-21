"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Modal from "@/components/Modal";
import TeamCard from "@/components/TeamCard";
import TeamCreateDialog from "@/components/TeamCreateDialog";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import { useAuth, useAuthErrorRedirect } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getEventById, getTeams, joinTeam } from "@/lib/api";
import { friendlyErrorMessage } from "@/lib/constants";
import { ApiError } from "@/lib/types";
import type { Event, Team } from "@/lib/types";

interface LoadedTeam {
  team: Team;
  event: Event | null;
}

type TeamsState =
  | { status: "loading" }
  | { status: "success"; items: LoadedTeam[] }
  | { status: "error"; message: string };

function TeamsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const { notify } = useToast();
  const [state, setState] = useState<TeamsState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinTarget, setJoinTarget] = useState<Team | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<ReadonlySet<number>>(new Set());

  const eventFilter = useMemo(() => {
    const raw = searchParams.get("event_id");
    const parsed = Number(raw);
    return raw !== null && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    getTeams(eventFilter)
      .then(async (res) => {
        const items = await Promise.all(
          res.data.map(async (team) => {
            try {
              const event = await getEventById(team.eventId);
              return { team, event };
            } catch {
              return { team, event: null };
            }
          }),
        );
        if (cancelled) return;
        setState({ status: "success", items });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, "/teams")) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Gagal memuat Cari Tim.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [eventFilter, redirectOnUnauthorized, reloadKey]);

  async function confirmJoin() {
    if (!joinTarget || joiningId !== null) return;
    const team = joinTarget;
    setJoiningId(team.id);
    setJoinTarget(null);
    try {
      await joinTeam(team.id);
      setJoinedIds((prev) => new Set(prev).add(team.id));
      notify("Berhasil bergabung ke tim.");
    } catch (err) {
      notify(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal bergabung.",
      );
    } finally {
      setJoiningId(null);
    }
  }

  const isGuest = user === null;
  const isStudent = user?.role === "student";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cari Tim</h1>
          <p className="mt-1 text-sm text-[var(--faint)]">
            Temukan rekan lomba dan funmatch.
          </p>
        </div>
        {isGuest ? (
          <Link
            href="/login?next=%2Fteams"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Masuk untuk buat post
          </Link>
        ) : isStudent ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Buat Post
          </button>
        ) : null}
      </div>
      {state.status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <EventCardSkeleton key={key} />
          ))}
        </div>
      ) : state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : state.items.length === 0 ? (
        <EmptyState
          title="Belum ada post Cari Tim"
          description="Buat post pertama untuk mencari rekan tim."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((item) => (
            <TeamCard
              key={item.team.id}
              team={item.team}
              event={item.event}
              isGuest={isGuest}
              isStudent={isStudent ?? false}
              joining={joiningId === item.team.id}
              joined={joinedIds.has(item.team.id)}
              onJoin={() => setJoinTarget(item.team)}
            />
          ))}
        </div>
      )}
      {isStudent ? (
        <TeamCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
      ) : null}
      <Modal
        open={joinTarget !== null}
        onClose={() => setJoinTarget(null)}
        title="Gabung tim?"
        description={
          joinTarget
            ? `Anda akan bergabung ke "${joinTarget.title}".`
            : undefined
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setJoinTarget(null)}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void confirmJoin()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              Konfirmasi
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--faint)]">
          Kontak pembuat post untuk koordinasi lebih lanjut.
        </p>
      </Modal>
    </main>
  );
}

export default function TeamsPage() {
  return (
    <Suspense>
      <TeamsContent />
    </Suspense>
  );
}
