"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import AuthShell from "@/components/AuthShell";
import { getSafeNext, useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isAuthenticated) {
    router.replace(getSafeNext(searchParams.get("next")));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await login({ email, password });
      router.replace(getSafeNext(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk. Silakan coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? (
        <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="text-sm text-[var(--faint)]">
          Email ITS
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-sm text-[var(--faint)]">
          Kata sandi
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
      <p className="text-sm text-[var(--faint)]">
        Belum punya akun?{" "}
        <Link href="/register" className="text-[var(--text)] underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Masuk" subtitle="Masuk untuk menjelajah dan mendaftar event.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
