import { apiRequest } from "@/lib/api/client";

import type {
  AdminLoginResponse,
  CurrentUserResponse,
  CustomerLoginResponse,
  CustomerRegisterResponse,
  LogoutResponse,
} from "@/types/auth";

export type AdminLoginInput = {
  email: string;
  password: string;
};

export type CustomerRegisterInput = {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  password: string;
};

export type CustomerLoginInput = {
  phone: string;
  password: string;
};

export async function registerCustomer(
  input: CustomerRegisterInput,
): Promise<CustomerRegisterResponse> {
  return apiRequest<CustomerRegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function loginCustomer(
  input: CustomerLoginInput,
): Promise<CustomerLoginResponse> {
  return apiRequest<CustomerLoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

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