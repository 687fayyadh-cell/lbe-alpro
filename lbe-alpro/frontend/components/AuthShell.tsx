import type { ReactNode } from "react";
import { CATEGORY_META } from "@/lib/constants";
import type { EventCategory } from "@/lib/types";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const CATEGORIES = Object.entries(CATEGORY_META) as [
  EventCategory,
  { label: string },
][];

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 px-4 py-10 md:grid-cols-2 md:gap-8">
      <div className="hidden flex-col justify-center md:flex">
        <p className="text-xl font-semibold">SinergiITS</p>
        <p className="mt-2 text-[var(--faint)]">
          Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS.
        </p>
        <ul className="mt-6 flex flex-col gap-2">
          {CATEGORIES.map(([value, meta]) => (
            <li
              key={value}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {meta.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--faint)]">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
