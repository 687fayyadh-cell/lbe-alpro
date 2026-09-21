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
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [];
  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm text-[var(--faint)]">
        Menampilkan {start}–{end} dari {total} event • Halaman {page} dari{" "}
        {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            aria-label={`Halaman ${number}`}
            aria-current={number === page ? "page" : undefined}
            disabled={number === page}
            onClick={() => onPageChange(number)}
            className={`rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 ${
              number === page
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {number}
          </button>
        ))}
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
