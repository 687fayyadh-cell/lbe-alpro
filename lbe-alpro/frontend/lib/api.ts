// SinergiITS HTTP client (FE-02).
// Single HTTP gateway: base URL from NEXT_PUBLIC_API_URL, Bearer header,
// standard envelope parsing. Components use the typed methods below,
// never fetch directly.

import { getToken } from "./auth";
import {
  mockCreateEvent,
  mockCreateTeam,
  mockGetEvent,
  mockGetEventRegistrants,
  mockGetEvents,
  mockGetMe,
  mockGetModerationEvents,
  mockGetMyRegistrations,
  mockGetOrganizerEvents,
  mockGetTeams,
  mockJoinTeam,
  mockLogin,
  mockRegister,
  mockRegisterForEvent,
  mockUpdateEvent,
  mockUpdateModerationStatus,
  mockUpdateRegistrationStatus,
} from "./mock";
import type {
  ApiErrorBody,
  ApiResponse,
  AuthResponse,
  CreateEventRequest,
  CreateTeamRequest,
  Event,
  EventFilters,
  EventStatus,
  LoginRequest,
  Paginated,
  PaginatedResponse,
  PaginationMeta,
  RegisterRequest,
  RegisterToEventRequest,
  Registrant,
  Registration,
  RegistrationStatus,
  Team,
  TeamMember,
  UpdateEventRequest,
  User,
} from "./types";
import { ApiError } from "./types";

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

function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Respons server tidak valid.",
      res.status,
    );
  }
}

function throwFromErrorPayload(payload: unknown, status: number): never {
  const err = payload as Partial<ApiErrorBody>;
  throw new ApiError(
    err.error?.code ?? "INTERNAL_ERROR",
    err.error?.message ?? "Terjadi kesalahan pada server.",
    status,
  );
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

  const payload = await parseJson(res);
  if (!res.ok) throwFromErrorPayload(payload, res.status);
  return (payload as ApiResponse<T>).data;
}

export async function apiFetchPaginated<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Paginated<T>> {
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

  const payload = await parseJson(res);
  if (!res.ok) throwFromErrorPayload(payload, res.status);
  const page = payload as PaginatedResponse<T>;
  const meta: PaginationMeta = page.meta ?? {
    page: 1,
    limit: Array.isArray(page.data) ? page.data.length : 0,
    total: Array.isArray(page.data) ? page.data.length : 0,
  };
  return { data: page.data, meta };
}

function toQuery(filters: EventFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  if (filters.page !== undefined)
    params.set("page", String(filters.page));
  if (filters.limit !== undefined)
    params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  if (isMockEnabled()) return mockRegister(body);
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body,
  });
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  if (isMockEnabled()) return mockLogin(body);
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body,
  });
}

export async function getMe(): Promise<User> {
  if (isMockEnabled()) return mockGetMe();
  return apiFetch<User>("/users/me");
}

export async function getEvents(
  filters: EventFilters = {},
): Promise<Paginated<Event>> {
  if (isMockEnabled()) return mockGetEvents(filters);
  return apiFetchPaginated<Event>(`/events${toQuery(filters)}`);
}

export async function getEvent(id: number): Promise<Event> {
  if (isMockEnabled()) return mockGetEvent(id);
  return apiFetch<Event>(`/events/${id}`);
}

/** Spec alias for the event-detail unit (FE-08). */
export async function getEventById(id: number): Promise<Event> {
  return getEvent(id);
}

/** Spec alias for the registration unit (FE-09). */
export async function registerToEvent(
  eventId: number,
  body: RegisterToEventRequest = {},
): Promise<Registration> {
  return registerForEvent(eventId, body);
}

export async function getMyRegistrations(
  page = 1,
  limit = 10,
): Promise<Paginated<Registration>> {
  if (isMockEnabled()) return mockGetMyRegistrations(page, limit);
  return apiFetchPaginated<Registration>(
    `/registrations/me?page=${page}&limit=${limit}`,
  );
}

export async function getOrganizerEvents(
  page = 1,
  limit = 10,
): Promise<Paginated<Event>> {
  if (isMockEnabled()) return mockGetOrganizerEvents(page, limit);
  return apiFetchPaginated<Event>(
    `/organizer/events?page=${page}&limit=${limit}`,
  );
}

export async function createEvent(body: CreateEventRequest): Promise<Event> {
  if (isMockEnabled()) return mockCreateEvent(body);
  return apiFetch<Event>("/events", { method: "POST", body });
}

export async function updateEvent(
  id: number,
  body: UpdateEventRequest,
): Promise<Event> {
  if (isMockEnabled()) return mockUpdateEvent(id, body);
  return apiFetch<Event>(`/events/${id}`, { method: "PUT", body });
}

function toRegistrant(item: Registrant | Registration): Registrant {
  if ("registration" in item) return item;
  return { registration: item, user: null };
}

export async function getEventRegistrants(
  eventId: number,
  page = 1,
  limit = 10,
): Promise<Paginated<Registrant>> {
  if (isMockEnabled()) return mockGetEventRegistrants(eventId, page, limit);
  const raw = await apiFetchPaginated<Registrant | Registration>(
    `/events/${eventId}/registrants?page=${page}&limit=${limit}`,
  );
  return { data: raw.data.map(toRegistrant), meta: raw.meta };
}

export async function updateRegistrationStatus(
  id: number,
  status: Extract<RegistrationStatus, "approved" | "rejected">,
): Promise<Registration> {
  if (isMockEnabled()) return mockUpdateRegistrationStatus(id, status);
  return apiFetch<Registration>(`/registrations/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}

export async function getModerationEvents(
  status: EventStatus = "pending",
  page = 1,
  limit = 10,
): Promise<Paginated<Event>> {
  if (isMockEnabled()) return mockGetModerationEvents(status, page, limit);
  return apiFetchPaginated<Event>(
    `/admin/events?status=${status}&page=${page}&limit=${limit}`,
  );
}

export async function updateModerationStatus(
  id: number,
  status: Extract<EventStatus, "published" | "rejected">,
): Promise<Event> {
  if (isMockEnabled()) return mockUpdateModerationStatus(id, status);
  return apiFetch<Event>(`/admin/events/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}

export async function getTeams(
  eventId?: number,
  page = 1,
  limit = 10,
): Promise<Paginated<Team>> {
  if (isMockEnabled()) return mockGetTeams(eventId, page, limit);
  const params = new URLSearchParams();
  if (eventId !== undefined) params.set("event_id", String(eventId));
  params.set("page", String(page));
  params.set("limit", String(limit));
  return apiFetchPaginated<Team>(`/teams?${params.toString()}`);
}

export async function createTeam(body: CreateTeamRequest): Promise<Team> {
  if (isMockEnabled()) return mockCreateTeam(body);
  return apiFetch<Team>("/teams", { method: "POST", body });
}

export async function joinTeam(teamId: number): Promise<TeamMember> {
  if (isMockEnabled()) return mockJoinTeam(teamId);
  return apiFetch<TeamMember>(`/teams/${teamId}/join`, { method: "POST" });
}

export async function registerForEvent(
  eventId: number,
  body: RegisterToEventRequest = {},
): Promise<Registration> {
  if (isMockEnabled()) return mockRegisterForEvent(eventId, body);
  return apiFetch<Registration>(`/events/${eventId}/register`, {
    method: "POST",
    body,
  });
}
