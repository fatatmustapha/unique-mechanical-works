import { apiRequest } from "@/lib/api/client";

export type HealthResponse = {
  success: boolean;
  data: {
    status: string;
    environment: string;
  };
  message?: string;
};

export function getHealth() {
  return apiRequest<HealthResponse>("/health", {
    method: "GET",
    skipCredentials: true,
  });
}