import { apiRequest } from "@/lib/api/client";

export type CarSaleSubmissionStatus = "pending" | "approved" | "rejected";

export type CarSaleSubmission = {
  submission_id: number;
  customer_id: number;
  branch_id: number;

  make: string;
  model: string;
  year: number | null;
  mileage: number | null;

  condition_type: "New" | "Nigerian Used" | "Foreign Used" | null;

  transmission: "Automatic" | "Manual" | null;

  fuel_type: "Petrol" | "Diesel" | "Hybrid" | "Electric" | null;

  color_exterior: string | null;
  expected_price: number | null;
  description: string | null;
  contact_phone: string | null;

  status: CarSaleSubmissionStatus;

  reviewed_by_admin_id?: number | null;
  admin_notes?: string | null;
  reviewed_at?: string | null;
  approved_car_id: number | null;

  created_at: string;
  updated_at: string;

  // These are optional because the repository may join
  // customer/branch information into admin results.
  
  branch_name?: string | null;
};

export type AdminCarSaleSubmissionsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminCarSaleSubmissionsResponse = {
  success: boolean;

  data: {
    submissions: CarSaleSubmission[];
    pagination: AdminCarSaleSubmissionsPagination;
  };

  message: string;
};

export type AdminCarSaleSubmissionResponse = {
  success: boolean;

  data: {
    submission: CarSaleSubmission;
  };

  message: string;
};

export type GetAdminCarSaleSubmissionsParams = {
  status?: CarSaleSubmissionStatus;
  branch_id?: number;
  page?: number;
  limit?: number;
};

export type ReviewCarSaleSubmissionInput = {
  decision: "approved" | "rejected";
  admin_notes?: string | null;
};

export async function getAdminCarSaleSubmissions(
  params: GetAdminCarSaleSubmissionsParams = {},
): Promise<AdminCarSaleSubmissionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.branch_id !== undefined) {
    searchParams.set("branch_id", String(params.branch_id));
  }

  searchParams.set("page", String(params.page ?? 1));

  searchParams.set("limit", String(params.limit ?? 20));

  return apiRequest<AdminCarSaleSubmissionsResponse>(
    `/admin/car-sale-submissions?${searchParams.toString()}`,
    {
      method: "GET",
    },
  );
}

export async function getAdminCarSaleSubmission(
  submissionId: number,
): Promise<AdminCarSaleSubmissionResponse> {
  return apiRequest<AdminCarSaleSubmissionResponse>(
    `/admin/car-sale-submissions/${submissionId}`,
    {
      method: "GET",
    },
  );
}

export async function reviewAdminCarSaleSubmission(
  submissionId: number,
  input: ReviewCarSaleSubmissionInput,
): Promise<AdminCarSaleSubmissionResponse> {
  return apiRequest<AdminCarSaleSubmissionResponse>(
    `/admin/car-sale-submissions/${submissionId}/review`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
