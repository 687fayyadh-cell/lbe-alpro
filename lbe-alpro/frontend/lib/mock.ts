// SinergiITS mock adapter (FE-03).
// Used ONLY by lib/api.ts when NEXT_PUBLIC_USE_MOCK_API=true.
// Same envelopes and error codes as docs/api-contract-v1.md.
// Components must never import this module directly.

import { getToken } from "./auth";
import { CATEGORY_META, EVENT_TYPE_META } from "./constants";
import type {
  AuthResponse,
  CreateEventRequest,
  CreateTeamRequest,
  Event,
  EventFilters,
  EventStatus,
  LoginRequest,
  Paginated,
  RegisterRequest,
  RegisterToEventRequest,
  Registrant,
  Registration,
  Team,
  TeamMember,
  UpdateEventRequest,
  User,
} from "./types";
import { ApiError } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();
const future = (days: number): string =>
  new Date(now + days * DAY_MS).toISOString();
const past = (days: number): string =>
  new Date(now - days * DAY_MS).toISOString();

const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Demo Mahasiswa",
    email: "demo@student.its.ac.id",
    role: "student",
    department: "Teknik Informatika",
    bio: null,
    createdAt: past(90),
    updatedAt: past(90),
  },
  {
    id: 2,
    name: "Demo Organizer",
    email: "demo@organizer.its.ac.id",
    role: "organizer",
    department: "HMSI",
    bio: null,
    createdAt: past(90),
    updatedAt: past(90),
  },
  {
    id: 3,
    name: "Mahasiswa Kedua",
    email: "kedua@student.its.ac.id",
    role: "student",
    department: "Teknik Elektro",
    bio: null,
    createdAt: past(60),
    updatedAt: past(60),
  },
];

const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    organizerId: 2,
    title: "Lomba Robotika Nasional",
    category: "keilmiahan",
    type: "lomba",
    description: "Kompetisi robot antar mahasiswa.",
    posterUrl: null,
    quota: 100,
    currentParticipants: 42,
    deadline: future(30),
    startDate: future(45),
    endDate: future(47),
    status: "published",
    createdAt: past(10),
    updatedAt: past(10),
  },
  {
    id: 2,
    organizerId: 2,
    title: "Funmatch Futsal Antar Departemen",
    category: "minat_bakat",
    type: "funmatch",
    description: "Kuota sudah penuh.",
    posterUrl: null,
    quota: 20,
    currentParticipants: 20,
    deadline: future(10),
    startDate: future(12),
    endDate: future(12),
    status: "published",
    createdAt: past(9),
    updatedAt: past(9),
  },
  {
    id: 3,
    organizerId: 2,
    title: "Bootcamp Startup Pemula",
    category: "kewirausahaan",
    type: "bootcamp",
    description: "Pendaftaran sudah ditutup.",
    posterUrl: null,
    quota: 50,
    currentParticipants: 12,
    deadline: past(1),
    startDate: past(2),
    endDate: future(5),
    status: "published",
    createdAt: past(20),
    updatedAt: past(20),
  },
  {
    id: 4,
    organizerId: 2,
    title: "Oprec Panitia Schematics",
    category: "manajerial",
    type: "oprec",
    description: "Rekrutmen panitia acara tahunan.",
    posterUrl: null,
    quota: 80,
    currentParticipants: 79,
    deadline: future(5),
    startDate: future(7),
    endDate: future(60),
    status: "published",
    createdAt: past(5),
    updatedAt: past(5),
  },
  {
    id: 5,
    organizerId: 2,
    title: "Workshop Riset AI",
    category: "keilmiahan",
    type: "workshop",
    description: "Pelatihan riset machine learning.",
    posterUrl: null,
    quota: 40,
    currentParticipants: 5,
    deadline: future(20),
    startDate: future(25),
    endDate: future(26),
    status: "published",
    createdAt: past(3),
    updatedAt: past(3),
  },
  {
    id: 6,
    organizerId: 2,
    title: "Bazar Kewirausahaan (draft)",
    category: "kewirausahaan",
    type: "bazar",
    description: "Belum tayang, menunggu moderasi.",
    posterUrl: null,
    quota: 30,
    currentParticipants: 0,
    deadline: future(15),
    startDate: future(18),
    endDate: future(19),
    status: "pending",
    createdAt: past(1),
    updatedAt: past(1),
  },
];

const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 1,
    eventId: 1,
    userId: 1,
    answer: null,
    attachmentUrl: null,
    status: "pending",
    registeredAt: past(2),
  },
  {
    id: 2,
    eventId: 1,
    userId: 3,
    answer: "Siap mengikuti seleksi.",
    attachmentUrl: "https://example.com/berkas.pdf",
    status: "approved",
    registeredAt: past(3),
  },
];

function tokenToUser(token: string | null): User {
  if (token === "mock-token-student") return MOCK_USERS[0];
  if (token === "mock-token-organizer") return MOCK_USERS[1];
  throw new ApiError("UNAUTHORIZED", "Token tidak valid.", 401);
}

export function mockRegister(body: RegisterRequest): Promise<AuthResponse> {
  if (!body.name || !body.email || !body.password) {
    throw new ApiError("VALIDATION_ERROR", "Data pendaftaran belum lengkap.", 400);
  }
  if (
    MOCK_USERS.some((u) => u.email === body.email) ||
    body.email === "demo@student.its.ac.id"
  ) {
    throw new ApiError("EMAIL_TAKEN", "Email sudah terdaftar.", 409);
  }
  const user: User = {
    id: MOCK_USERS.length + 1,
    name: body.name,
    email: body.email,
    role: "student",
    department: null,
    bio: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return Promise.resolve({ token: "mock-token-student", user });
}

export function mockLogin(body: LoginRequest): Promise<AuthResponse> {
  if (body.email === "demo@student.its.ac.id") {
    if (body.password !== "password123") {
      throw new ApiError("UNAUTHORIZED", "Email atau kata sandi salah.", 401);
    }
    return Promise.resolve({ token: "mock-token-student", user: MOCK_USERS[0] });
  }
  if (body.email === "demo@organizer.its.ac.id") {
    if (body.password !== "password123") {
      throw new ApiError("UNAUTHORIZED", "Email atau kata sandi salah.", 401);
    }
    return Promise.resolve({
      token: "mock-token-organizer",
      user: MOCK_USERS[1],
    });
  }
  throw new ApiError("UNAUTHORIZED", "Email atau kata sandi salah.", 401);
}

export function mockGetMe(): Promise<User> {
  return Promise.resolve(tokenToUser(getToken()));
}

function isOpen(event: Event): boolean {
  return (
    new Date(event.deadline).getTime() >= Date.now() &&
    event.currentParticipants < event.quota
  );
}

export function mockGetEvents(
  filters: EventFilters = {},
): Promise<Paginated<Event>> {
  const limit = Math.min(Math.max(filters.limit ?? 10, 1), 50);
  const page = Math.max(filters.page ?? 1, 1);
  const keyword = (filters.q ?? "").trim().toLowerCase();

  const filtered = MOCK_EVENTS.filter((event) => {
    if (event.status !== "published") return false;
    if (filters.category && event.category !== filters.category) return false;
    if (filters.type && event.type !== filters.type) return false;
    if (filters.status === "open" && !isOpen(event)) return false;
    if (filters.status === "closed" && isOpen(event)) return false;
    if (
      keyword &&
      !`${event.title} ${event.description}`.toLowerCase().includes(keyword)
    ) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  return Promise.resolve({
    data: filtered.slice(start, start + limit),
    meta: { page, limit, total },
  });
}

export function mockGetMyRegistrations(  page = 1,
  limit = 10,
): Promise<Paginated<Registration>> {
  const user = tokenToUser(getToken());
  const mine = MOCK_REGISTRATIONS.filter((r) => r.userId === user.id);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return Promise.resolve({
    data: mine.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: mine.length },
  });
}

export function mockGetEvent(id: number): Promise<Event> {
  const event = MOCK_EVENTS.find((e) => e.id === id);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  return Promise.resolve(event);
}

export function mockRegisterForEvent(
  eventId: number,
  body: RegisterToEventRequest = {},
): Promise<Registration> {
  const user = tokenToUser(getToken());
  const event = MOCK_EVENTS.find((e) => e.id === eventId);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  if (event.status !== "published") {
    throw new ApiError(
      "EVENT_NOT_PUBLISHED",
      "Event belum dibuka untuk pendaftaran.",
      422,
    );
  }
  if (new Date(event.deadline).getTime() < Date.now()) {
    throw new ApiError(
      "EVENT_DEADLINE_PASSED",
      "Batas pendaftaran event ini sudah lewat.",
      422,
    );
  }
  if (event.currentParticipants >= event.quota) {
    throw new ApiError(
      "EVENT_QUOTA_FULL",
      "Maaf, kuota pendaftaran untuk event ini sudah penuh.",
      422,
    );
  }
  if (
    MOCK_REGISTRATIONS.some(
      (r) => r.eventId === eventId && r.userId === user.id,
    )
  ) {
    throw new ApiError(
      "ALREADY_REGISTERED",
      "Anda sudah terdaftar di event ini.",
      409,
    );
  }
  const registration: Registration = {
    id: MOCK_REGISTRATIONS.length + 1,
    eventId,
    userId: user.id,
    answer: body.answer ?? null,
    attachmentUrl: body.attachmentUrl ?? null,
    status: "pending",
    registeredAt: new Date().toISOString(),
  };
  MOCK_REGISTRATIONS.push(registration);
  event.currentParticipants += 1;
  return Promise.resolve(registration);
}

function requireOrganizer() {
  const user = tokenToUser(getToken());
  if (user.role !== "organizer" && user.role !== "admin") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya penyelenggara yang dapat mengakses data ini.",
      403,
    );
  }
  return user;
}

export function mockGetOrganizerEvents(
  page = 1,
  limit = 10,
): Promise<Paginated<Event>> {
  const user = requireOrganizer();
  const mine =
    user.role === "admin"
      ? [...MOCK_EVENTS]
      : MOCK_EVENTS.filter((e) => e.organizerId === user.id);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return Promise.resolve({
    data: mine.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: mine.length },
  });
}

function validateEventInput(body: CreateEventRequest | UpdateEventRequest) {
  if (body.title !== undefined && !body.title.trim()) {
    throw new ApiError("VALIDATION_ERROR", "Judul event wajib diisi.", 400);
  }
  if (body.quota !== undefined && (!Number.isInteger(body.quota) || body.quota <= 0)) {
    throw new ApiError("VALIDATION_ERROR", "Kuota harus bilangan bulat di atas 0.", 400);
  }
  if (
    body.category !== undefined &&
    !(body.category in CATEGORY_META)
  ) {
    throw new ApiError("VALIDATION_ERROR", "Kategori event tidak valid.", 400);
  }
  if (body.type !== undefined && !(body.type in EVENT_TYPE_META)) {
    throw new ApiError("VALIDATION_ERROR", "Tipe event tidak valid.", 400);
  }
  if (body.deadline !== undefined && Number.isNaN(Date.parse(body.deadline))) {
    throw new ApiError("VALIDATION_ERROR", "Tenggat waktu tidak valid.", 400);
  }
}

export function mockCreateEvent(body: CreateEventRequest): Promise<Event> {
  const user = requireOrganizer();
  validateEventInput(body);
  if (!body.title?.trim() || body.quota === undefined || !body.deadline) {
    throw new ApiError("VALIDATION_ERROR", "Judul, kuota, dan tenggat wajib diisi.", 400);
  }
  const id = Math.max(...MOCK_EVENTS.map((e) => e.id)) + 1;
  const timestamp = new Date().toISOString();
  const event: Event = {
    id,
    organizerId: user.id,
    title: body.title.trim(),
    category: body.category,
    type: body.type,
    description: body.description,
    posterUrl: body.posterUrl ?? null,
    quota: body.quota,
    currentParticipants: 0,
    deadline: body.deadline,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  MOCK_EVENTS.push(event);
  return Promise.resolve(event);
}

export function mockUpdateEvent(
  id: number,
  body: UpdateEventRequest,
): Promise<Event> {
  const user = requireOrganizer();
  const event = MOCK_EVENTS.find((e) => e.id === id);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  if (event.organizerId !== user.id && user.role !== "admin") {
    throw new ApiError(
      "FORBIDDEN",
      "Anda bukan pemilik event ini.",
      403,
    );
  }
  validateEventInput(body);
  if (body.title !== undefined) event.title = body.title.trim();
  if (body.category !== undefined) event.category = body.category;
  if (body.type !== undefined) event.type = body.type;
  if (body.description !== undefined) event.description = body.description;
  if (body.posterUrl !== undefined) event.posterUrl = body.posterUrl || null;
  if (body.quota !== undefined) event.quota = body.quota;
  if (body.deadline !== undefined) event.deadline = body.deadline;
  if (body.startDate !== undefined) event.startDate = body.startDate || null;
  if (body.endDate !== undefined) event.endDate = body.endDate || null;
  event.updatedAt = new Date().toISOString();
  return Promise.resolve(event);
}

function toRegistrant(registration: Registration): Registrant {
  const user = MOCK_USERS.find((u) => u.id === registration.userId) ?? null;
  return {
    registration,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
  };
}

function requireEventOwner(eventId: number) {
  const user = requireOrganizer();
  const event = MOCK_EVENTS.find((e) => e.id === eventId);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  if (event.organizerId !== user.id && user.role !== "admin") {
    throw new ApiError("FORBIDDEN", "Anda bukan pemilik event ini.", 403);
  }
  return { user, event };
}

export function mockGetEventRegistrants(
  eventId: number,
  page = 1,
  limit = 10,
): Promise<Paginated<Registrant>> {
  requireEventOwner(eventId);
  const rows = MOCK_REGISTRATIONS.filter((r) => r.eventId === eventId).map(
    toRegistrant,
  );
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return Promise.resolve({
    data: rows.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: rows.length },
  });
}

export function mockUpdateRegistrationStatus(
  id: number,
  status: "approved" | "rejected",
): Promise<Registration> {
  requireOrganizer();
  const registration = MOCK_REGISTRATIONS.find((r) => r.id === id);
  if (!registration) {
    throw new ApiError("NOT_FOUND", "Pendaftaran tidak ditemukan.", 404);
  }
  const { user } = requireEventOwner(registration.eventId);
  void user;
  if (registration.status !== "pending") {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Hanya pendaftaran menunggu yang dapat diubah.",
      400,
    );
  }
  registration.status = status;
  return Promise.resolve(registration);
}

function requireAdmin() {
  const user = tokenToUser(getToken());
  if (user.role !== "admin") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya admin yang dapat mengakses data ini.",
      403,
    );
  }
  return user;
}

export function mockGetModerationEvents(
  status: EventStatus | undefined,
  page = 1,
  limit = 10,
): Promise<Paginated<Event>> {
  requireAdmin();
  const filtered = status
    ? MOCK_EVENTS.filter((e) => e.status === status)
    : [...MOCK_EVENTS];
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return Promise.resolve({
    data: filtered.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: filtered.length },
  });
}

export function mockUpdateModerationStatus(
  id: number,
  status: Extract<EventStatus, "published" | "rejected">,
): Promise<Event> {
  requireAdmin();
  const event = MOCK_EVENTS.find((e) => e.id === id);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  event.status = status;
  event.updatedAt = new Date().toISOString();
  return Promise.resolve(event);
}

const MOCK_TEAMS: Team[] = [
  {
    id: 1,
    eventId: 1,
    creatorId: 3,
    title: "Tim Robotika ITS",
    description: "Mencari 2 anggota divisi mekanik untuk lomba robotika.",
    contactInfo: "Hubungi @robotika_its",
    maxMembers: 4,
    createdAt: past(4),
  },
  {
    id: 2,
    eventId: 2,
    creatorId: 1,
    title: "Sparing Futsal Sore Ini",
    description: "Butuh 1 kiper untuk funmatch antar departemen.",
    contactInfo: "Hubungi @futsal_sore",
    maxMembers: null,
    createdAt: past(1),
  },
  {
    id: 3,
    eventId: 1,
    creatorId: 3,
    title: "Tim Paper Riset AI",
    description: "Mencari anggota untuk riset dan publikasi paper.",
    contactInfo: "Hubungi @riset_ai",
    maxMembers: 5,
    createdAt: past(2),
  },
  {
    id: 4,
    eventId: 4,
    creatorId: 3,
    title: "Duo Oprec Schematics",
    description: "Slot terakhir divisi acara.",
    contactInfo: "Hubungi @duo_oprec",
    maxMembers: 1,
    createdAt: past(2),
  },
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 1, teamId: 1, userId: 3, joinedAt: past(4) },
  { id: 2, teamId: 1, userId: 1, joinedAt: past(3) },
  { id: 3, teamId: 3, userId: 3, joinedAt: past(2) },
  { id: 4, teamId: 4, userId: 3, joinedAt: past(2) },
];

function requireStudent() {
  const user = tokenToUser(getToken());
  if (user.role !== "student") {
    throw new ApiError(
      "FORBIDDEN",
      "Hanya mahasiswa yang dapat mengakses fitur ini.",
      403,
    );
  }
  return user;
}

export function mockGetTeams(
  eventId: number | undefined,
  page = 1,
  limit = 10,
): Promise<Paginated<Team>> {
  const filtered = eventId
    ? MOCK_TEAMS.filter((t) => t.eventId === eventId)
    : [...MOCK_TEAMS];
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return Promise.resolve({
    data: filtered.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total: filtered.length },
  });
}

export function mockCreateTeam(body: CreateTeamRequest): Promise<Team> {
  const user = requireStudent();
  const event = MOCK_EVENTS.find((e) => e.id === body.eventId);
  if (!event) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.", 404);
  }
  if (!body.title.trim() || !body.description.trim() || !body.contactInfo.trim()) {
    throw new ApiError("VALIDATION_ERROR", "Judul, deskripsi, dan kontak wajib diisi.", 400);
  }
  const id = Math.max(...MOCK_TEAMS.map((t) => t.id)) + 1;
  const timestamp = new Date().toISOString();
  const team: Team = {
    id,
    eventId: body.eventId,
    creatorId: user.id,
    title: body.title.trim(),
    description: body.description.trim(),
    contactInfo: body.contactInfo.trim(),
    maxMembers: body.maxMembers ?? null,
    createdAt: timestamp,
  };
  MOCK_TEAMS.push(team);
  MOCK_TEAM_MEMBERS.push({ id: MOCK_TEAM_MEMBERS.length + 1, teamId: id, userId: user.id, joinedAt: timestamp });
  return Promise.resolve(team);
}

export function mockJoinTeam(teamId: number): Promise<TeamMember> {
  const user = requireStudent();
  const team = MOCK_TEAMS.find((t) => t.id === teamId);
  if (!team) {
    throw new ApiError("NOT_FOUND", "Post pencarian tim tidak ditemukan.", 404);
  }
  if (team.creatorId === user.id) {
    throw new ApiError("VALIDATION_ERROR", "Anda pembuat post ini.", 400);
  }
  if (MOCK_TEAM_MEMBERS.some((m) => m.teamId === teamId && m.userId === user.id)) {
    throw new ApiError("ALREADY_REGISTERED", "Anda sudah bergabung di tim ini.", 409);
  }
  const count = MOCK_TEAM_MEMBERS.filter((m) => m.teamId === teamId).length;
  if (team.maxMembers !== null && count >= team.maxMembers) {
    throw new ApiError("EVENT_QUOTA_FULL", "Tim ini sudah penuh.", 422);
  }
  const member: TeamMember = {
    id: MOCK_TEAM_MEMBERS.length + 1,
    teamId,
    userId: user.id,
    joinedAt: new Date().toISOString(),
  };
  MOCK_TEAM_MEMBERS.push(member);
  return Promise.resolve(member);
}
