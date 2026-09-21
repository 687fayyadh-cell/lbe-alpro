"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import ErrorState from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/StatusBadge";
import { useAuth, useAuthErrorRedirect } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getCurrentUser, updateCurrentUser } from "@/lib/api";
import { friendlyErrorMessage, ROLE_META } from "@/lib/constants";
import { ApiError } from "@/lib/types";
import type { User } from "@/lib/types";

type ProfileState =
  | { status: "loading" }
  | { status: "ready"; user: User }
  | { status: "error"; message: string };

function ProfileContent() {
  const router = useRouter();
  const { refresh } = useAuth();
  const redirectOnUnauthorized = useAuthErrorRedirect();
  const { notify } = useToast();
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        setState({ status: "ready", user });
        setName(user.name);
        setDepartment(user.department ?? "");
        setBio(user.bio ?? "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (redirectOnUnauthorized(err, "/profile")) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Gagal memuat profil.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [redirectOnUnauthorized, reloadKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      setFormError("Nama wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await updateCurrentUser({
        name: name.trim(),
        department: department.trim(),
        bio: bio.trim(),
      });
      setState({ status: "ready", user: updated });
      await refresh();
      notify("Profil berhasil disimpan.");
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? friendlyErrorMessage(err.code, err.message)
          : "Gagal menyimpan profil.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <div className="mt-6">
        {state.status === "loading" ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-3 h-24 w-full" />
          </>
        ) : state.status === "error" ? (
          <ErrorState
            message={state.message}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {formError ? (
              <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={ROLE_META[state.user.role].label}
                tone={ROLE_META[state.user.role].tone}
              />
              <span className="text-sm text-[var(--faint)]">{state.user.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-name" className="text-sm text-[var(--faint)]">
                Nama lengkap
              </label>
              <input
                id="profile-name"
                type="text"
                required
                autoComplete="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-department" className="text-sm text-[var(--faint)]">
                Departemen
              </label>
              <input
                id="profile-department"
                type="text"
                className={inputClass}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profile-bio" className="text-sm text-[var(--faint)]">
                Bio singkat
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                className={inputClass}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
              >
                Kembali
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
