const TONE_CLASSES: Record<string, string> = {
  "role-student": "bg-sky-500/15 text-sky-300",
  "role-organizer": "bg-violet-500/15 text-violet-300",
  "role-admin": "bg-rose-500/15 text-rose-300",
  "category-minat-bakat": "bg-purple-500/15 text-purple-300",
  "category-kewirausahaan": "bg-orange-500/15 text-orange-300",
  "category-manajerial": "bg-blue-500/15 text-blue-300",
  "category-keilmiahan": "bg-teal-500/15 text-teal-300",
  "status-pending": "bg-yellow-500/15 text-yellow-300",
  "status-published": "bg-green-500/15 text-green-300",
  "status-approved": "bg-green-500/15 text-green-300",
  "status-rejected": "bg-red-500/15 text-red-300",
  "status-open": "bg-green-500/15 text-green-300",
  "status-closed": "bg-zinc-500/15 text-zinc-300",
};

const NEUTRAL = "bg-zinc-500/15 text-zinc-300";

interface StatusBadgeProps {
  label: string;
  tone: string;
}

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone] ?? NEUTRAL}`}
    >
      {label}
    </span>
  );
}
