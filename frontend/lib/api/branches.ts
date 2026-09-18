import { apiRequest } from "@/lib/api/client";

export type Branch = {
  branch_id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BranchesResponse = {
  success: boolean;
  data: Branch[];
  message: string;
};

export async function getBranches(): Promise<BranchesResponse> {
  return apiRequest<BranchesResponse>(
    "/branches",
    {
      method: "GET",
    },
  );
}