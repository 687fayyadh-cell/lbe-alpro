"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Skeleton } from "./Skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/lib/types";

export type GuardAccess = "organizer" | "admin";

const ACCESS_ROLES: Record<GuardAccess, Role[]> = {
  organizer: ["organizer", "admin"],
  admin: ["admin"],
};

interface RequireRoleProps {
  access: GuardAccess;
  children: ReactNode;
}

/**
 * Client-side UX guard. Backend stays the RBAC authority.
 * Usage (G2): wrap protected segments, e.g. app/organizer/layout.tsx
 *   <RequireRole access="organizer">{children}</RequireRole>
 * Never wrap /login, /register, or /forbidden (redirect targets).
 */
export default function RequireRole({ access, children }: RequireRoleProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!ACCESS_ROLES[access].includes(user.role)) {
      router.replace("/forbidden");
    }
  }, [isLoading, user, access, router, pathname]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-3 h-4 w-full" />
      </main>
    );
  }
  if (!user || !ACCESS_ROLES[access].includes(user.role)) return null;
  return <>{children}</>;
}
