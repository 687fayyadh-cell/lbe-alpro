"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe, login as apiLogin, register as apiRegister } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth";
import { ApiError } from "@/lib/types";
import type { LoginRequest, RegisterRequest, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Safe redirect target: same-origin absolute path only, fallback "/". */
export function getSafeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getToken();
    if (!stored) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
      setTokenState(stored);
    } catch {
      clearToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hydrate session from localStorage (external system) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const login = useCallback(async (body: LoginRequest) => {
    const res = await apiLogin(body);
    setToken(res.token);
    setUser(res.user);
    setTokenState(res.token);
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const res = await apiRegister(body);
    setToken(res.token);
    setUser(res.user);
    setTokenState(res.token);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setTokenState(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, isLoading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  return ctx;
}

/**
 * Shared 401 convention (FE-11): clear token and redirect to login.
 * Returns true when the error was handled. 403 is rendered as
 * forbidden state by the caller; other errors show API messages.
 */
export function useAuthErrorRedirect() {
  const router = useRouter();
  return useCallback(
    (err: unknown, next: string): boolean => {
      if (
        err instanceof ApiError &&
        (err.code === "UNAUTHORIZED" || err.status === 401)
      ) {
        clearToken();
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return true;
      }
      return false;
    },
    [router],
  );
}
