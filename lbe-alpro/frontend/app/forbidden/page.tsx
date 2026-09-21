import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-center">
      <p className="text-sm text-[var(--faint)]">403</p>
      <h1 className="mt-1 text-2xl font-semibold">Akses ditolak</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--faint)]">
        Peran akun Anda tidak memiliki akses ke halaman ini. Halaman
        organizer khusus penyelenggara dan admin; halaman moderasi khusus
        admin.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/login"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          Masuk
        </Link>
      </div>
    </main>
  );
}
