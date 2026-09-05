const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Une erreur est survenue.");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (phone: string, password: string) =>
    request<{ accessToken: string; user: { id: string; role: string; phone: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ phone, password }) },
    ),

  register: (data: {
    phone: string;
    password: string;
    role: "CLIENT" | "PROFESSIONAL";
    firstName: string;
    lastName: string;
    email?: string;
    businessName?: string;
  }) =>
    request<{ accessToken: string; user: { id: string; role: string; phone: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getMe: (token: string) => request<any>("/users/me", { token }),

  updateClientProfile: (token: string, data: Record<string, unknown>) =>
    request<any>("/users/me/client-profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),

  updateProfessionalProfile: (token: string, data: Record<string, unknown>) =>
    request<any>("/users/me/professional-profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),

  // --- Localisation (sections 9-11, 49) ---
  createLocation: (
    token: string,
    data: { latitude: number; longitude: number; wilaya: string; daira?: string; commune?: string },
  ) => request<any>("/locations", { method: "POST", token, body: JSON.stringify(data) }),

  findNearbyProfessionals: (lat: number, lng: number, radiusKm: number, professionId?: string) =>
    request<any[]>(
      `/locations/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}${
        professionId ? `&professionId=${professionId}` : ""
      }`,
    ),

  getNearbyCounts: (lat: number, lng: number, radiusKm: number) =>
    request<Array<{ profession: any; count: number }>>(
      `/locations/nearby-counts?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
    ),

  getCategoryTree: () => request<any[]>("/categories"),

  getPublicProfessionalProfile: (id: string) => request<any>(`/users/professionals/${id}`),

  createReview: (
    token: string,
    data: { professionalId: string; requestId?: string; ratingOverall: number; comment?: string },
  ) => request<any>("/reviews", { method: "POST", token, body: JSON.stringify(data) }),

  // --- Demandes client (sections 5-7, 27-29) ---
  createRequest: (token: string, data: { rawDescription: string; urgency?: string; professionId?: string }) =>
    request<any>("/requests", { method: "POST", token, body: JSON.stringify(data) }),

  getMyRequests: (token: string) => request<any[]>("/requests/me", { token }),

  getRequest: (token: string, id: string) => request<any>(`/requests/${id}`, { token }),

  markRequestCompleted: (token: string, id: string) =>
    request<any>(`/requests/${id}/complete`, { method: "POST", token }),

  // --- Offres artisan (section 8, 30) ---
  createOffer: (token: string, data: { rawDescription: string }) =>
    request<any>("/offers", { method: "POST", token, body: JSON.stringify(data) }),

  getMyOffers: (token: string) => request<any[]>("/offers/me", { token }),

  // --- Matching (section 26) ---
  getMyMatches: (token: string) => request<any[]>("/matching/me", { token }),

  respondToMatch: (token: string, matchId: string, accepted: boolean, message?: string) =>
    request<any>(`/matching/${matchId}/respond`, {
      method: "POST",
      token,
      body: JSON.stringify({ accepted, message }),
    }),

  runMatching: (token: string, requestId: string) =>
    request<any>(`/matching/requests/${requestId}/run`, { method: "POST", token }),

  getQueue: (token: string, priority?: string) =>
    request<any[]>(`/validation/queue${priority ? `?priority=${priority}` : ""}`, { token }),

  getCase: (token: string, id: string) => request<any>(`/validation/cases/${id}`, { token }),

  claimCase: (token: string, id: string) =>
    request<any>(`/validation/cases/${id}/claim`, { method: "POST", token }),

  startCall: (token: string, caseId: string) =>
    request<any>(`/validation/cases/${caseId}/start-call`, { method: "POST", token }),

  resolveCall: (
    token: string,
    callId: string,
    body: { outcome: string; summary?: string; operatorNote?: string },
  ) =>
    request<any>(`/validation/calls/${callId}/resolve`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  publish: (token: string, serviceRequestId?: string, offerId?: string) =>
    request<any>("/validation/publish", {
      method: "POST",
      token,
      body: JSON.stringify({ serviceRequestId, offerId }),
    }),

  // --- Administration (section 30) ---
  getAdminStats: (token: string) => request<any>("/admin/stats", { token }),
  listAdminArtisans: (token: string) => request<any[]>("/admin/artisans", { token }),
  listAdminClients: (token: string) => request<any[]>("/admin/clients", { token }),
  listAdminRequests: (token: string) => request<any[]>("/admin/requests", { token }),
  suspendUser: (token: string, userId: string) =>
    request<any>(`/admin/users/${userId}/suspend`, { method: "POST", token }),
  activateUser: (token: string, userId: string) =>
    request<any>(`/admin/users/${userId}/activate`, { method: "POST", token }),

  listAdmins: (token: string) => request<any[]>("/admin/admins", { token }),
  createAdminUser: (
    token: string,
    data: { phone: string; password: string; firstName: string; lastName: string; role: string },
  ) => request<any>("/admin/admins", { method: "POST", token, body: JSON.stringify(data) }),
  getAuditLog: (token: string) => request<any[]>("/admin/audit-log", { token }),

  // --- Gestion de la taxonomie (sections 12, 32-35) ---
  createCategory: (token: string, data: { name: string; nameAr?: string; icon?: string }) =>
    request<any>("/categories", { method: "POST", token, body: JSON.stringify(data) }),
  createProfession: (token: string, data: { categoryId: string; name: string; nameAr?: string; synonyms?: string[] }) =>
    request<any>("/categories/professions", { method: "POST", token, body: JSON.stringify(data) }),
  createSpecialty: (token: string, data: { professionId: string; name: string; nameAr?: string }) =>
    request<any>("/categories/specialties", { method: "POST", token, body: JSON.stringify(data) }),
  deactivateCategory: (token: string, id: string) =>
    request<any>(`/categories/${id}`, { method: "DELETE", token }),
  deactivateProfession: (token: string, id: string) =>
    request<any>(`/categories/professions/${id}`, { method: "DELETE", token }),

  // --- Notifications (section 17) ---
  getNotifications: (token: string) => request<any[]>("/notifications/me", { token }),
  getUnreadNotificationCount: (token: string) => request<number>("/notifications/me/unread-count", { token }),
  markNotificationRead: (token: string, id: string) =>
    request<any>(`/notifications/${id}/read`, { method: "POST", token }),
};
