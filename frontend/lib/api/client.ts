import { API_URL } from "@/lib/constants/env";

type ApiRequestOptions = RequestInit & {
  skipCredentials?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { skipCredentials = false, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    credentials: skipCredentials ? "omit" : "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

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