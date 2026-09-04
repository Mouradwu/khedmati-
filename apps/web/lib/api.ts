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
    businessName?: string;
  }) =>
    request<{ accessToken: string; user: { id: string; role: string; phone: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getMe: (token: string) => request<any>("/users/me", { token }),

  updateProfessionalProfile: (token: string, data: Record<string, unknown>) =>
    request<any>("/users/me/professional-profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),

  // --- Demandes client (sections 5-7, 27-29) ---
  createRequest: (token: string, data: { rawDescription: string; urgency?: string }) =>
    request<any>("/requests", { method: "POST", token, body: JSON.stringify(data) }),

  getMyRequests: (token: string) => request<any[]>("/requests/me", { token }),

  getRequest: (token: string, id: string) => request<any>(`/requests/${id}`, { token }),

  // --- Offres artisan (section 8, 30) ---
  createOffer: (token: string, data: { rawDescription: string }) =>
    request<any>("/offers", { method: "POST", token, body: JSON.stringify(data) }),

  getMyOffers: (token: string) => request<any[]>("/offers/me", { token }),

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
};
