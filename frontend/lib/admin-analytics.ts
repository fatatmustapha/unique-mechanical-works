export type DashboardSummary = {
  customers: {
    total: number;
    active: number;
  };

  cars: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    available: number;
    reserved: number;
    sold: number;
    featured: number;
  };

  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };

  car_sale_submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/admin/dashboard/summary`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard statistics.");
  }

  const result = await response.json();

  return result.data.summary as DashboardSummary;
}