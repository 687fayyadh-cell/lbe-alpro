export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">403 — Akses ditolak</h1>
      <p className="mt-2 text-[var(--faint)]">
        Peran akun Anda tidak memiliki akses ke halaman ini.
      </p>
    </main>
  );
}
