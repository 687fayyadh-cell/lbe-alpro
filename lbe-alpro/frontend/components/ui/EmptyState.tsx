interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-[var(--faint)]">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
