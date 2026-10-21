export type InvoiceContactType = "walk_in_customer" | "supplier";

export interface InvoiceContact {
  contact_id: number;
  contact_type: InvoiceContactType;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceContactInput {
  contact_type: InvoiceContactType;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/**
 * Search existing walk-in customers or suppliers.
 */
export async function searchInvoiceContacts(
  contactType: InvoiceContactType,
  search: string,
): Promise<InvoiceContact[]> {
  const params = new URLSearchParams({
    contact_type: contactType,
    search: search.trim(),
    page: "1",
    limit: "20",
  });

  const response = await fetch(
    `${API_URL}/admin/invoice-contacts?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to search invoice contacts.");
  }

  const result = await response.json();

  return result.data.contacts;
}

/**
 * Create a new walk-in customer or supplier.
 */
export async function createInvoiceContact(
  input: CreateInvoiceContactInput,
): Promise<InvoiceContact> {
  const response = await fetch(`${API_URL}/admin/invoice-contacts`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ?? "Unable to create invoice contact.",
    );
  }

  const result = await response.json();

  return result.data.contact;
}