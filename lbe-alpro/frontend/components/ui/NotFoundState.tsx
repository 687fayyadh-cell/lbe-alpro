interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function NotFoundState({
  title = "Tidak ditemukan",
  description = "Data yang Anda cari tidak ada atau sudah dihapus.",
  actionLabel,
  onAction,
}: NotFoundStateProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <p className="text-sm text-[var(--faint)]">404</p>
      <h2 className="mt-1 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--faint)]">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md border border-[var(--border)] px-4 py-2 text-sm"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
