// SinergiITS HTTP client (G0 skeleton).
// All API calls must go through apiFetch: base URL from
// NEXT_PUBLIC_API_URL, Bearer header, standard envelope parsing.

import { getToken } from "./auth";
import type { ApiErrorBody, ApiResponse } from "./types";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "NEXT_PUBLIC_API_URL belum dikonfigurasi.",
      500,
    );
  }
  return baseUrl.replace(/\/$/, "");
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Respons server tidak valid.", res.status);
  }

  if (!res.ok) {
    const err = payload as Partial<ApiErrorBody>;
    throw new ApiError(
      err.error?.code ?? "INTERNAL_ERROR",
      err.error?.message ?? "Terjadi kesalahan pada server.",
      res.status,
    );
  }

  return (payload as ApiResponse<T>).data;
}
