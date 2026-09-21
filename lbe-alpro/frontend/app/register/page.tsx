"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Nama, email, dan kata sandi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        ...(department ? { department } : {}),
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal mendaftar. Silakan coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell title="Daftar" subtitle="Buat akun mahasiswa untuk mulai mendaftar event.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error ? (
          <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1">
          <label htmlFor="register-name" className="text-sm text-[var(--faint)]">
            Nama lengkap
          </label>
          <input
            id="register-name"
            type="text"
            required
            autoComplete="name"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-email" className="text-sm text-[var(--faint)]">
            Email ITS
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-department" className="text-sm text-[var(--faint)]">
            Departemen (opsional)
          </label>
          <input
            id="register-department"
            type="text"
            autoComplete="organization"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-password" className="text-sm text-[var(--faint)]">
            Kata sandi
          </label>
          <input
            id="register-password"
            type="password"
            required
            autoComplete="new-password"
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
          {pending ? "Mendaftarkan…" : "Daftar"}
        </button>
        <p className="text-sm text-[var(--faint)]">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[var(--text)] underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
