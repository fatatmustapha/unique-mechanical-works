import { apiRequest } from "@/lib/api/client";

import type {
  AdminLoginResponse,
  CurrentUserResponse,
  LogoutResponse,
} from "@/types/auth";

export type AdminLoginInput = {
  email: string;
  password: string;
};

export async function loginAdmin(
  input: AdminLoginInput,
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>(
    "/auth/admin/login",
    {
      method: "POST",

      body: JSON.stringify(input),
    },
  );
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(
    "/auth/me",
    {
      method: "GET",
    },
  );
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(
    "/auth/logout",
    {
      method: "POST",
    },
  );
}