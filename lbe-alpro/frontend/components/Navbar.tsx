"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { ROLE_META } from "@/lib/constants";
import type { User } from "@/lib/types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [{ href: "/", label: "Jelajah" }];
  if (user) links.push({ href: "/teams", label: "Cari Tim" });
  if (user && (user.role === "organizer" || user.role === "admin")) {
    links.push({ href: "/organizer/events", label: "Organizer" });
  }
  if (user && user.role === "admin") {
    links.push({ href: "/admin/moderation", label: "Moderasi" });
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold">
          SinergiITS
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--faint)] hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <StatusBadge
                label={ROLE_META[user.role].label}
                tone={ROLE_META[user.role].tone}
              />
              <Link
                href="/profile"
                className="text-sm text-[var(--faint)] hover:text-[var(--text)]"
              >
                Profil
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[var(--faint)] hover:text-[var(--text)]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-white"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </div>
      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            className="fixed inset-0 z-10 cursor-default bg-black/60 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            aria-label="Navigasi seluler"
            className="relative z-20 flex flex-col gap-1 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2 text-sm hover:bg-[var(--background)]"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--background)]"
              >
                Keluar
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2 text-sm hover:bg-[var(--background)]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2 text-sm hover:bg-[var(--background)]"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </>
      ) : null}
    </header>
  );
}
