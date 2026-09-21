"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToast";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <ToastProvider>
      <Navbar user={user} onLogout={logout} />
      {children}
    </ToastProvider>
  );
}
