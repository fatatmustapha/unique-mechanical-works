/* =========================================================
   INVOICE ARCHIVE TYPES
   ========================================================= */

export type InvoiceOwnerType =
  | "registered_customer"
  | "walk_in_customer"
  | "supplier";

export interface ArchivedInvoice {
  archive_id: number;
  customer_id: number | null;
  contact_id: number | null;
  title: string;
  invoice_number: string | null;
  invoice_date: string;
  amount: string | number | null;
  description: string | null;
  owner_type: InvoiceOwnerType;
  owner_name: string;
  owner_phone: string | null;
  file_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceArchiveFilters {
  search?: string;
  owner_type?: InvoiceOwnerType | "customer";
  customer_id?: number;
  contact_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceArchiveResult {
  invoices: ArchivedInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* =========================================================
   GET ARCHIVED INVOICES
   ========================================================= */

export async function fetchArchivedInvoices(
  filters: InvoiceArchiveFilters = {},
): Promise<InvoiceArchiveResult> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(
    `${apiUrl}/admin/invoice-archive?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve archived invoices.");
  }

  const result = await response.json();

  return result.data;
}

export interface CreateArchivedInvoiceInput {
  customer_id?: number;
  contact_id?: number;
  title: string;
  invoice_number?: string;
  invoice_date: string;
  amount?: string;
  description?: string;
  files: File[];
}

export async function createArchivedInvoice(
  input: CreateArchivedInvoiceInput,
): Promise<void> {
  const formData = new FormData();

  if (input.customer_id !== undefined) {
    formData.append("customer_id", String(input.customer_id));
  }

  if (input.contact_id !== undefined) {
    formData.append("contact_id", String(input.contact_id));
  }

  formData.append("title", input.title);
  formData.append("invoice_date", input.invoice_date);

  if (input.invoice_number) {
    formData.append("invoice_number", input.invoice_number);
  }

  if (input.amount) {
    formData.append("amount", input.amount);
  }

  if (input.description) {
    formData.append("description", input.description);
  }

  for (const file of input.files) {
    formData.append("files", file);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(`${apiUrl}/admin/invoice-archive`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ?? "Failed to upload invoice. Please try again.",
    );
  }
}
// Retrieve a single archived invoice and its attachments.

export interface ArchivedInvoiceFile {
  file_id: number;
  archive_id: number;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface ArchivedInvoiceDetails extends ArchivedInvoice {
  files: ArchivedInvoiceFile[];
}

export async function fetchArchivedInvoiceById(
  archiveId: number,
): Promise<ArchivedInvoiceDetails> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(`${apiUrl}/admin/invoice-archive/${archiveId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(result?.message ?? "Unable to retrieve invoice details.");
  }

  const result = await response.json();

  return result.data.invoice;
}

export async function downloadArchivedInvoiceFile(
  archiveId: number,
  fileId: number,
  originalName: string,
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(
    `${apiUrl}/admin/invoice-archive/${archiveId}/files/${fileId}/download`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ?? "Unable to download invoice attachment.",
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
export async function previewArchivedInvoiceFile(
  archiveId: number,
  fileId: number,
): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(
    `${apiUrl}/admin/invoice-archive/${archiveId}/files/${fileId}/download`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(result?.message ?? "Unable to preview invoice attachment.");
  }

  const blob = await response.blob();

  return URL.createObjectURL(blob);
}

export interface UpdateArchivedInvoiceInput {
  title: string;
  invoice_number?: string;
  invoice_date: string;
  amount?: string;
  description?: string;
}

export async function updateArchivedInvoice(
  archiveId: number,
  input: UpdateArchivedInvoiceInput,
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(`${apiUrl}/admin/invoice-archive/${archiveId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(result?.message ?? "Failed to update invoice.");
  }
}

export async function deleteArchivedInvoice(archiveId: number): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const response = await fetch(`${apiUrl}/admin/invoice-archive/${archiveId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(result?.message ?? "Failed to delete invoice.");
  }
}
