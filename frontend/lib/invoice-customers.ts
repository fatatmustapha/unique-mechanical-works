export interface InvoiceCustomer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface CustomerSearchResponse {
  data: InvoiceCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function searchInvoiceCustomers(
  search: string,
): Promise<InvoiceCustomer[]> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const params = new URLSearchParams({
    search: search.trim(),
    page: "1",
    limit: "20",
  });

  const response = await fetch(
    `${apiUrl}/customers?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to search registered customers.");
  }

  const result: CustomerSearchResponse = await response.json();

  return result.data;
}