"use client";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center"
    >
      <p className="text-sm text-red-300">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}
