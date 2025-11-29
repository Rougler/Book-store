import { getApiBaseUrl } from "@/lib/env";
import { Tokens } from "@/lib/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Role = "user" | "admin";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  role?: Role;
};

type TokenStorage = {
  getTokens: () => Tokens | null;
  setTokens: (tokens: Tokens) => void;
  clearTokens: () => void;
};

const storageFactory = (prefix: string): TokenStorage => {
  const key = `${prefix}-tokens`;

  const getTokens = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const value = window.localStorage.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as Tokens;
    } catch (error) {
      console.error("Failed to parse tokens", error);
      window.localStorage.removeItem(key);
      return null;
    }
  };

  const setTokens = (tokens: Tokens) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(tokens));
  };

  const clearTokens = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  };

  return { getTokens, setTokens, clearTokens };
};

export const userTokenStore = storageFactory("bookstore-user");
export const adminTokenStore = storageFactory("bookstore-admin");

const resolveStore = (role: Role | undefined): TokenStorage => {
  if (role === "admin") {
    return adminTokenStore;
  }

  return userTokenStore;
};

const refreshTokens = async (store: TokenStorage) => {
  const tokens = store.getTokens();
  if (!tokens) {
    return null;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });

    if (!response.ok) {
      store.clearTokens();
      return null;
    }

    const nextTokens = (await response.json()) as Tokens;
    store.setTokens(nextTokens);
    return nextTokens;
  } catch (error) {
    console.error("Unable to refresh token", error);
    store.clearTokens();
    return null;
  }
};

export const apiRequest = async <T>(
  path: string,
  { method = "GET", body, headers, requireAuth = false, role }: RequestOptions = {},
): Promise<T> => {
  const store = resolveStore(role);
  const apiUrl = `${getApiBaseUrl()}${path}`;

  const assembledHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requireAuth) {
    const tokens = store.getTokens();
    if (!tokens) {
      // Clear any stale tokens and trigger logout
      store.clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout", { detail: { role } }));
      }
      throw new Error("Authentication required");
    }
    assembledHeaders.Authorization = `Bearer ${tokens.access_token}`;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method,
      headers: assembledHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (fetchError) {
    // Handle network errors (connection refused, CORS, etc.)
    if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
      throw new Error("Failed to fetch: Unable to connect to the server. Please ensure the backend is running.");
    }
    throw fetchError;
  }

  if (response.status === 401 && requireAuth) {
    const refreshed = await refreshTokens(store);
    if (!refreshed) {
      // Clear tokens and trigger logout
      store.clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout", { detail: { role } }));
      }
      throw new Error("Authentication expired");
    }

    let retryResponse: Response;
    try {
      retryResponse = await fetch(apiUrl, {
        method,
        headers: {
          ...assembledHeaders,
          Authorization: `Bearer ${refreshed.access_token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
    } catch (fetchError) {
      // Handle network errors on retry
      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        throw new Error("Failed to fetch: Unable to connect to the server. Please ensure the backend is running.");
      }
      throw fetchError;
    }

    if (!retryResponse.ok) {
      const errorPayload = await retryResponse.json().catch(() => null);
      throw new Error(errorPayload?.detail ?? "Request failed");
    }

    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message = errorPayload?.detail ?? errorPayload?.message ?? "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const uploadFile = async (
  path: string,
  file: File,
  { requireAuth = false, role }: { requireAuth?: boolean; role?: Role } = {},
): Promise<{ url: string }> => {
  const store = resolveStore(role);
  const apiUrl = `${getApiBaseUrl()}${path}`;

  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};

  if (requireAuth) {
    const tokens = store.getTokens();
    if (!tokens) {
      // Clear any stale tokens and trigger logout
      store.clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout", { detail: { role } }));
      }
      throw new Error("Authentication required");
    }
    headers.Authorization = `Bearer ${tokens.access_token}`;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: formData,
    cache: "no-store",
  });

  if (response.status === 401 && requireAuth) {
    const refreshed = await refreshTokens(store);
    if (!refreshed) {
      // Clear tokens and trigger logout
      store.clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-logout", { detail: { role } }));
      }
      throw new Error("Authentication expired");
    }

    const retryResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        ...headers,
        Authorization: `Bearer ${refreshed.access_token}`,
      },
      body: formData,
      cache: "no-store",
    });

    if (!retryResponse.ok) {
      const errorPayload = await retryResponse.json().catch(() => null);
      throw new Error(errorPayload?.detail ?? "Upload failed");
    }

    return retryResponse.json() as Promise<{ url: string }>;
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message = errorPayload?.detail ?? errorPayload?.message ?? "Upload failed";
    throw new Error(message);
  }

  return response.json() as Promise<{ url: string }>;
};

