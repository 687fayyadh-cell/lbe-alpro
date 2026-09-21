"use client";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-sm text-[var(--faint)]">
        Halaman {page} dari {totalPages} ({total} event)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}
