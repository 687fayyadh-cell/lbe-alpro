// SinergiITS shared API types (G0 freeze).
// API slugs are source of truth; UI labels live in lib/constants.ts.
// Mirrors backend DTOs in context/01-architecture.md ("Data model").

export type Role = "student" | "organizer" | "admin";

export type EventCategory =
  | "minat_bakat"
  | "kewirausahaan"
  | "manajerial"
  | "keilmiahan";

export type EventType =
  | "lomba"
  | "bootcamp"
  | "oprec"
  | "workshop"
  | "funmatch"
  | "bazar"
  | "riset";

export type EventStatus = "pending" | "published" | "rejected";

export type RegistrationStatus = "pending" | "approved" | "rejected";

/** Derived on read, never stored: open = deadline >= now AND currentParticipants < quota. */
export type EventAvailability = "open" | "closed";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  organizerId: number;
  title: string;
  category: EventCategory;
  type: EventType;
  description: string;
  posterUrl: string | null;
  quota: number;
  currentParticipants: number;
  deadline: string;
  startDate: string | null;
  endDate: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  answer: string | null;
  attachmentUrl: string | null;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface Team {
  id: number;
  eventId: number;
  creatorId: number;
  title: string;
  description: string;
  contactInfo: string;
  maxMembers: number | null;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  joinedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface EventFilters {
  category?: EventCategory;
  type?: EventType;
  /** Derived availability filter, not a stored status. */
  status?: EventAvailability;
  q?: string;
  page?: number;
  limit?: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  department?: string;
  bio?: string;
}

export interface CreateEventRequest {
  title: string;
  category: EventCategory;
  type: EventType;
  description: string;
  posterUrl?: string;
  quota: number;
  deadline: string;
  startDate?: string;
  endDate?: string;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

export interface RegisterToEventRequest {
  answer?: string;
  attachmentUrl?: string;
}

export interface UpdateRegistrationStatusRequest {
  status: Extract<RegistrationStatus, "approved" | "rejected">;
}

export interface CreateTeamRequest {
  eventId: number;
  title: string;
  description: string;
  contactInfo: string;
  maxMembers?: number;
}

export interface UpdateEventStatusRequest {
  status: Extract<EventStatus, "published" | "rejected">;
}

export interface UpdateUserRoleRequest {
  role: Role;
}
