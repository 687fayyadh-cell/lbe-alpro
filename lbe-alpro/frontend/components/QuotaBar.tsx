import { quotaPercent } from "@/lib/format";

interface QuotaBarProps {
  current: number;
  quota: number;
}

export default function QuotaBar({ current, quota }: QuotaBarProps) {
  return (
    <div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={quota}
        aria-label={`Kuota terisi ${current} dari ${quota}`}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${quotaPercent(current, quota)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--faint)]">
        {current}/{quota} peserta
      </p>
    </div>
  );
}
