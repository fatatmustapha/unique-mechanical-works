import { API_URL } from "@/lib/constants/env";

type ApiRequestOptions = RequestInit & {
  skipCredentials?: boolean;
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  // If several requests fail at the same time,
  // they should share one refresh request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    skipCredentials = false,
    skipAuthRefresh = false,
    headers,
    ...requestOptions
  } = options;

  const makeRequest = () => {
    const isFormData = requestOptions.body instanceof FormData;

    return fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,

      credentials: skipCredentials ? "omit" : "include",

      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
        ...headers,
      },
    });
  };

  let response = await makeRequest();

  /*
   * If the access token has expired:
   *
   * 1. Ask the backend for a new session.
   * 2. Backend replaces the auth cookies.
   * 3. Retry the original request once.
   */
  if (
    response.status === 401 &&
    !skipCredentials &&
    !skipAuthRefresh &&
    endpoint !== "/auth/refresh" &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/admin/login"
  ) {
    const refreshed = await refreshSession();

    if (refreshed) {
      response = await makeRequest();
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
