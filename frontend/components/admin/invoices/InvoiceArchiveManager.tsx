"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";

import {
  fetchArchivedInvoices,
  createArchivedInvoice,
  fetchArchivedInvoiceById,
  downloadArchivedInvoiceFile,
  previewArchivedInvoiceFile,
  updateArchivedInvoice,
  deleteArchivedInvoice,
  type ArchivedInvoiceDetails,
  type ArchivedInvoiceFile,
  type ArchivedInvoice,
} from "@/lib/invoice-archive";

import {
  searchInvoiceCustomers,
  type InvoiceCustomer,
} from "@/lib/invoice-customers";

import {
  searchInvoiceContacts,
  createInvoiceContact,
  type InvoiceContact,
} from "@/lib/invoice-contacts";

import AdminSelect from "@/components/admin/AdminSelect";

type InvoiceTab = "all" | "customers" | "suppliers";

const tabs: { id: InvoiceTab; label: string }[] = [
  { id: "all", label: "All Invoices" },
  { id: "customers", label: "Customers" },
  { id: "suppliers", label: "Suppliers" },
];

const formatDate = (value: string) => {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const formatAmount = (value: string | number | null) => {
  if (value === null) {
    return "Not specified";
  }

  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatOwnerType = (type: string) => {
  if (type === "registered_customer") {
    return "Registered Customer";
  }

  if (type === "walk_in_customer") {
    return "Walk-in Customer";
  }

  return "Supplier";
};

export default function InvoiceArchiveManager() {
  const [activeTab, setActiveTab] = useState<InvoiceTab>("all");

  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<InvoiceCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<InvoiceCustomer | null>(null);

  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(
    null,
  );

  const [invoiceOwnerType, setInvoiceOwnerType] = useState<
    "registered_customer" | "walk_in_customer" | "supplier"
  >("registered_customer");

  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState<InvoiceContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<InvoiceContact | null>(
    null,
  );

  const [searchingContacts, setSearchingContacts] = useState(false);
  const [contactSearchError, setContactSearchError] = useState<string | null>(
    null,
  );

  const [showNewContactForm, setShowNewContactForm] = useState(false);

  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactAddress, setNewContactAddress] = useState("");

  const [savingContact, setSavingContact] = useState(false);
  const [newContactError, setNewContactError] = useState<string | null>(null);

  // Invoice information
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");

  // Invoice attachments
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);

  // Submission status
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invoiceFormError, setInvoiceFormError] = useState<string | null>(null);
  // Search
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Invoice data
  const [invoices, setInvoices] = useState<ArchivedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Invoice details
  const [selectedInvoice, setSelectedInvoice] =
    useState<ArchivedInvoiceDetails | null>(null);

  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<ArchivedInvoiceDetails | null>(null);

  const [deletingInvoice, setDeletingInvoice] = useState(false);

  const [deleteInvoiceError, setDeleteInvoiceError] = useState<string | null>(
    null,
  );
  const [editingInvoice, setEditingInvoice] =
    useState<ArchivedInvoiceDetails | null>(null);

  const [editInvoiceTitle, setEditInvoiceTitle] = useState("");
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [editInvoiceDate, setEditInvoiceDate] = useState("");
  const [editInvoiceAmount, setEditInvoiceAmount] = useState("");
  const [editInvoiceDescription, setEditInvoiceDescription] = useState("");

  const [savingInvoiceEdit, setSavingInvoiceEdit] = useState(false);
  const [editInvoiceError, setEditInvoiceError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [loadingInvoiceDetails, setLoadingInvoiceDetails] = useState(false);

  const [invoiceDetailsError, setInvoiceDetailsError] = useState<string | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;

    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchArchivedInvoices({
          search: searchTerm,
          owner_type:
            activeTab === "customers"
              ? "customer"
              : activeTab === "suppliers"
                ? "supplier"
                : undefined,
          date_from: appliedDateFrom,
          date_to: appliedDateTo,
          page,
          limit: 20,
        });

        if (cancelled) return;

        setInvoices(result.invoices);
        setTotalPages(result.pagination.totalPages);
        setTotalInvoices(result.pagination.total);
      } catch (error: unknown) {
        if (cancelled) return;

        console.error("Failed to load invoices:", error);

        setError("Unable to load archived invoices. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, appliedDateFrom, appliedDateTo, page, refreshKey, activeTab]);
  const refreshInvoices = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) {
      setCustomerResults([]);
      setCustomerSearchError("Enter a name, phone number, or email.");
      return;
    }

    try {
      setSearchingCustomers(true);
      setCustomerSearchError(null);
      setSelectedCustomer(null);

      const results = await searchInvoiceCustomers(customerSearch);

      setCustomerResults(results);
    } catch (error) {
      console.error("Customer search failed:", error);
      setCustomerResults([]);
      setCustomerSearchError("Unable to search customers. Please try again.");
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleViewInvoice = async (archiveId: number) => {
    try {
      setShowInvoiceDetails(true);
      setLoadingInvoiceDetails(true);
      setInvoiceDetailsError(null);
      setSelectedInvoice(null);

      const invoice = await fetchArchivedInvoiceById(archiveId);

      setSelectedInvoice(invoice);
    } catch (error) {
      console.error("Failed to load invoice:", error);

      setInvoiceDetailsError(
        error instanceof Error
          ? error.message
          : "Unable to load invoice details.",
      );
    } finally {
      setLoadingInvoiceDetails(false);
    }
  };

  const handleEditInvoice = (invoice: ArchivedInvoiceDetails) => {
    setEditingInvoice(invoice);

    setEditInvoiceTitle(invoice.title);
    setEditInvoiceNumber(invoice.invoice_number ?? "");
    setEditInvoiceDate(invoice.invoice_date.slice(0, 10));
    setEditInvoiceAmount(invoice.amount != null ? String(invoice.amount) : "");
    setEditInvoiceDescription(invoice.description ?? "");

    setEditInvoiceError(null);
    setShowInvoiceDetails(false);
    setShowEditInvoice(true);
  };

  const handleSaveInvoice = async () => {
    // 1. Validate the invoice owner
    if (invoiceOwnerType === "registered_customer" && !selectedCustomer) {
      setInvoiceFormError("Please select a registered customer.");
      return;
    }

    if (invoiceOwnerType !== "registered_customer" && !selectedContact) {
      setInvoiceFormError("Please select a walk-in customer or supplier.");
      return;
    }

    // 2. Validate required invoice information
    if (!invoiceTitle.trim()) {
      setInvoiceFormError("Please enter an invoice title.");
      return;
    }

    if (!invoiceDate) {
      setInvoiceFormError("Please select an invoice date.");
      return;
    }

    // 3. Validate attachments
    if (invoiceFiles.length === 0) {
      setInvoiceFormError("Please attach at least one invoice file.");
      return;
    }

    // 4. Save the invoice
    try {
      setSavingInvoice(true);
      setInvoiceFormError(null);

      await createArchivedInvoice({
        ...(invoiceOwnerType === "registered_customer"
          ? { customer_id: selectedCustomer!.customer_id }
          : { contact_id: selectedContact!.contact_id }),

        title: invoiceTitle.trim(),
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        amount: invoiceAmount.trim(),
        description: invoiceDescription.trim(),
        files: invoiceFiles,
      });

      // 5. Reset invoice information after successful upload
      setInvoiceTitle("");
      setInvoiceNumber("");
      setInvoiceDate("");
      setInvoiceAmount("");
      setInvoiceDescription("");
      setInvoiceFiles([]);

      // Reset selected owner
      setSelectedCustomer(null);
      setSelectedContact(null);
      setCustomerSearch("");
      setContactSearch("");
      setCustomerResults([]);
      setContactResults([]);

      // Close popup
      setShowAddInvoice(false);

      // Refresh the archive
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      console.error("Failed to save invoice:", error);

      setInvoiceFormError(
        error instanceof Error
          ? error.message
          : "Unable to save invoice. Please try again.",
      );
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleCreateContact = async () => {
    if (invoiceOwnerType === "registered_customer") return;

    if (newContactName.trim().length < 2) {
      setNewContactError("Please enter a name with at least 2 characters.");
      return;
    }

    try {
      setSavingContact(true);
      setNewContactError(null);

      const contact = await createInvoiceContact({
        contact_type: invoiceOwnerType,
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        address: newContactAddress.trim(),
      });

      setSelectedContact(contact);
      setContactSearch(contact.name);
      setContactResults([]);
      setContactSearchError(null);

      setShowNewContactForm(false);
      setNewContactName("");
      setNewContactPhone("");
      setNewContactAddress("");
    } catch (error) {
      console.error("Failed to create contact:", error);
      setNewContactError("Unable to create contact. Please try again.");
    } finally {
      setSavingContact(false);
    }
  };

  const handleContactSearch = async () => {
    if (invoiceOwnerType === "registered_customer") return;

    if (!contactSearch.trim()) {
      setContactResults([]);
      setContactSearchError("Enter a name or phone number.");
      return;
    }

    try {
      setSearchingContacts(true);
      setContactSearchError(null);
      setSelectedContact(null);

      const results = await searchInvoiceContacts(
        invoiceOwnerType,
        contactSearch,
      );

      setContactResults(results);
    } catch (error) {
      console.error("Contact search failed:", error);
      setContactResults([]);
      setContactSearchError("Unable to search contacts. Please try again.");
    } finally {
      setSearchingContacts(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Add Invoice Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setInvoiceOwnerType("registered_customer");
            setCustomerSearch("");
            setCustomerResults([]);
            setSelectedCustomer(null);
            setCustomerSearchError(null);
            setShowAddInvoice(true);
          }}
          className="bg-prussian px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-prussian/90"
        >
          + Add Invoice
        </button>
      </div>
      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="flex flex-wrap gap-2 border-b border-prussian/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setPage(1);
              setActiveTab(tab.id);
            }}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-bronze text-prussian"
                : "border-transparent text-slate-500 hover:text-prussian"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =====================================================
          ALL INVOICES
      ===================================================== */}

      {(activeTab === "all" ||
        activeTab === "customers" ||
        activeTab === "suppliers") && (
        <div className="border border-prussian/10 bg-white">
          {/* Header */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-prussian/10 px-5 py-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-prussian">
                {activeTab === "customers"
                  ? "Customer Invoices"
                  : activeTab === "suppliers"
                    ? "Supplier Invoices"
                    : "Invoice Archive"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {activeTab === "customers"
                  ? "View and manage invoices for registered and walk-in customers."
                  : activeTab === "suppliers"
                    ? "View and manage invoices from workshop suppliers."
                    : "View and manage all archived invoices."}
              </p>
            </div>

            <button
              type="button"
              onClick={refreshInvoices}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-prussian/20 px-4 py-2 text-sm font-semibold text-prussian transition-colors hover:bg-prussian/5 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 border-b border-prussian/10 p-5 sm:flex-row"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, phone, invoice number..."
              aria-label="Search archived invoices"
              className="min-w-0 flex-1 border border-prussian/20 bg-white px-4 py-3 text-sm text-prussian outline-none focus:border-bronze"
            />

            <button
              type="submit"
              className="bg-prussian px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-prussian/90"
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearSearch}
              className="border border-prussian/20 px-5 py-3 text-sm font-semibold text-prussian hover:bg-prussian/5"
            >
              Clear
            </button>
          </form>

          {/* Date Filters */}
          <div className="flex flex-col gap-4 border-b border-prussian/10 p-5 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="invoice-date-from"
                className="mb-2 block text-sm font-semibold text-prussian"
              >
                From Date
              </label>

              <input
                id="invoice-date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full border border-prussian/20 bg-white px-4 py-3 text-sm text-prussian outline-none focus:border-bronze"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="invoice-date-to"
                className="mb-2 block text-sm font-semibold text-prussian"
              >
                To Date
              </label>

              <input
                id="invoice-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full border border-prussian/20 bg-white px-4 py-3 text-sm text-prussian outline-none focus:border-bronze"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (dateFrom && dateTo && dateFrom > dateTo) {
                  return;
                }

                setPage(1);
                setAppliedDateFrom(dateFrom);
                setAppliedDateTo(dateTo);
              }}
              className="bg-prussian px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-prussian/90"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setAppliedDateFrom("");
                setAppliedDateTo("");
                setPage(1);
              }}
              className="border border-prussian/20 px-5 py-3 text-sm font-semibold text-prussian hover:bg-prussian/5"
            >
              Clear Dates
            </button>
          </div>

          {/* =================================================
              LOADING STATE
          ================================================= */}

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading invoices...
            </div>
          ) : error ? (
            /* ===============================================
               ERROR STATE
            =============================================== */

            <div className="px-6 py-16 text-center">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={refreshInvoices}
                className="mt-4 text-sm font-semibold text-prussian underline"
              >
                Try Again
              </button>
            </div>
          ) : invoices.length === 0 ? (
            /* ===============================================
               EMPTY STATE
            =============================================== */

            <div className="px-6 py-16 text-center">
              <FileText size={36} className="mx-auto text-slate-400" />

              <h3 className="mt-4 font-heading text-lg font-bold text-prussian">
                {searchTerm
                  ? "No matching invoices"
                  : activeTab === "customers"
                    ? "No customer invoices yet"
                    : activeTab === "suppliers"
                      ? "No supplier invoices yet"
                      : "No archived invoices yet"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {searchTerm
                  ? "Try a different search term."
                  : "Uploaded invoices will appear here."}
              </p>
            </div>
          ) : (
            /* ===============================================
               INVOICE TABLE
            =============================================== */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-prussian/5 text-prussian">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Invoice</th>

                    <th className="px-5 py-4 font-semibold">
                      Customer / Supplier
                    </th>

                    <th className="px-5 py-4 font-semibold">Date</th>

                    <th className="px-5 py-4 font-semibold">Amount</th>

                    <th className="px-5 py-4 font-semibold">Files</th>

                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-prussian/10">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.archive_id}
                      className="hover:bg-prussian/[0.02]"
                    >
                      {/* Invoice */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-prussian">
                          {invoice.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.invoice_number || "No invoice number"}
                        </p>
                      </td>

                      {/* Owner */}

                      <td className="px-5 py-4">
                        <p className="font-medium text-prussian">
                          {invoice.owner_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatOwnerType(invoice.owner_type)}
                        </p>

                        {invoice.owner_phone && (
                          <p className="mt-1 text-xs text-slate-400">
                            {invoice.owner_phone}
                          </p>
                        )}
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(invoice.invoice_date)}
                      </td>

                      {/* Amount */}

                      <td className="px-5 py-4 font-medium text-prussian">
                        {formatAmount(invoice.amount)}
                      </td>

                      {/* Attachments */}

                      <td className="px-5 py-4 text-slate-600">
                        {invoice.file_count}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void handleViewInvoice(invoice.archive_id)
                          }
                          className="border border-[#08294B] px-4 py-2 text-sm font-semibold text-[#08294B] transition-colors hover:bg-[#08294B] hover:text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading && !error && totalInvoices > 0 && (
            <div className="flex flex-col gap-3 border-t border-prussian/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {totalInvoices} invoice
                {totalInvoices !== 1 ? "s" : ""}
                {" · "}
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {/* Previous */}

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="border border-prussian/20 px-4 py-2 text-sm font-semibold text-prussian hover:bg-prussian/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* Next */}

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  className="border border-prussian/20 px-4 py-2 text-sm font-semibold text-prussian hover:bg-prussian/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Invoice Panel */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-full max-w-2xl border border-prussian/10 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-prussian">
                Add New Invoice
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowAddInvoice(false);
                  setInvoiceOwnerType("registered_customer");
                  setCustomerSearch("");
                  setCustomerResults([]);
                  setSelectedCustomer(null);
                  setCustomerSearchError(null);
                }}
                className="text-sm font-semibold text-slate-500 hover:text-prussian"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <label
                htmlFor="invoice-owner-type"
                className="block text-sm font-semibold text-prussian"
              >
                Invoice For
              </label>

              <AdminSelect
                value={invoiceOwnerType}
                ariaLabel="Invoice owner type"
                options={[
                  {
                    value: "registered_customer",
                    label: "Registered Customer",
                  },
                  {
                    value: "walk_in_customer",
                    label: "Walk-in Customer",
                  },
                  {
                    value: "supplier",
                    label: "Supplier",
                  },
                ]}
                onChange={(value) => {
                  setInvoiceOwnerType(
                    value as
                      | "registered_customer"
                      | "walk_in_customer"
                      | "supplier",
                  );

                  // Clear registered customer selection
                  setCustomerSearch("");
                  setCustomerResults([]);
                  setSelectedCustomer(null);
                  setCustomerSearchError(null);

                  // Clear walk-in customer / supplier selection
                  setContactSearch("");
                  setContactResults([]);
                  setSelectedContact(null);
                  setContactSearchError(null);

                  // Close and reset the new contact form
                  setShowNewContactForm(false);
                  setNewContactName("");
                  setNewContactPhone("");
                  setNewContactAddress("");
                  setNewContactError(null);
                }}
              />

              <p className="text-xs text-slate-500">
                {invoiceOwnerType === "registered_customer"
                  ? "Select a customer who already has an account."
                  : invoiceOwnerType === "walk_in_customer"
                    ? "Select or add a customer who does not have an account."
                    : "Select or add a supplier."}
              </p>
            </div>

            {/* Registered Customer Search */}
            {invoiceOwnerType === "registered_customer" && (
              <div className="mt-6 space-y-3">
                <label
                  htmlFor="invoice-customer-search"
                  className="block text-sm font-semibold text-prussian"
                >
                  Find Registered Customer
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="invoice-customer-search"
                    type="search"
                    value={customerSearch}
                    onChange={(event) => {
                      setCustomerSearch(event.target.value);
                      setSelectedCustomer(null);
                      setCustomerResults([]);
                    }}
                    placeholder="Search by name, phone, or email"
                    className="min-w-0 flex-1 border border-prussian/20 bg-white px-4 py-3 text-sm text-prussian outline-none focus:border-bronze"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCustomerSearch()}
                    disabled={searchingCustomers}
                    className="bg-prussian px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {searchingCustomers ? "Searching..." : "Find Customer"}
                  </button>
                </div>

                {customerSearchError && (
                  <p className="text-sm text-red-700">{customerSearchError}</p>
                )}

                {customerResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-prussian/10">
                    {customerResults.map((customer) => (
                      <button
                        key={customer.customer_id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerResults([]);
                          setCustomerSearch(
                            `${customer.first_name} ${customer.last_name}`,
                          );
                        }}
                        className="block w-full border-b border-prussian/10 px-4 py-3 text-left hover:bg-prussian/5"
                      >
                        <p className="text-sm font-semibold text-prussian">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.phone || "No phone"} ·{" "}
                          {customer.email || "No email"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-semibold text-green-800">
                      Selected: {selectedCustomer.first_name}{" "}
                      {selectedCustomer.last_name}
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      Customer ID: {selectedCustomer.customer_id}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Walk-in Customer / Supplier Search */}
            {invoiceOwnerType !== "registered_customer" && (
              <div className="mt-6 space-y-3">
                <label
                  htmlFor="invoice-contact-search"
                  className="block text-sm font-semibold text-prussian"
                >
                  {invoiceOwnerType === "supplier"
                    ? "Find Supplier"
                    : "Find Walk-in Customer"}
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="invoice-contact-search"
                    type="search"
                    value={contactSearch}
                    onChange={(event) => {
                      setContactSearch(event.target.value);
                      setSelectedContact(null);
                      setContactResults([]);
                      setContactSearchError(null);
                    }}
                    placeholder="Search by name or phone"
                    className="min-w-0 flex-1 border border-prussian/20 bg-white px-4 py-3 text-sm text-prussian outline-none focus:border-bronze"
                  />

                  <button
                    type="button"
                    onClick={() => void handleContactSearch()}
                    disabled={searchingContacts}
                    className="bg-prussian px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {searchingContacts ? "Searching..." : "Find"}
                  </button>
                </div>

                {contactSearchError && (
                  <p className="text-sm text-red-700">{contactSearchError}</p>
                )}

                {contactResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-prussian/10">
                    {contactResults.map((contact) => (
                      <button
                        key={contact.contact_id}
                        type="button"
                        onClick={() => {
                          setSelectedContact(contact);
                          setContactResults([]);
                          setContactSearch(contact.name);
                        }}
                        className="block w-full border-b border-prussian/10 px-4 py-3 text-left hover:bg-prussian/5"
                      >
                        <p className="text-sm font-semibold text-prussian">
                          {contact.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {contact.phone || "No phone number"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedContact && (
                  <div className="border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-semibold text-green-800">
                      Selected: {selectedContact.name}
                    </p>

                    <p className="mt-1 text-xs text-green-700">
                      Contact ID: {selectedContact.contact_id}
                    </p>
                  </div>
                )}
                {/* Add New Contact */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewContactForm(!showNewContactForm);
                      setNewContactError(null);
                    }}
                    className="text-sm font-semibold text-[#08294B] hover:underline"
                  >
                    {showNewContactForm
                      ? "− Cancel New Contact"
                      : invoiceOwnerType === "supplier"
                        ? "+ Add New Supplier"
                        : "+ Add New Walk-in Customer"}
                  </button>

                  {showNewContactForm && (
                    <div className="mt-4 space-y-3 border border-gray-200 bg-gray-50 p-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newContactName}
                          onChange={(event) =>
                            setNewContactName(event.target.value)
                          }
                          placeholder="Enter full name"
                          className="w-full border border-gray-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={newContactPhone}
                          onChange={(event) =>
                            setNewContactPhone(event.target.value)
                          }
                          placeholder="Enter phone number"
                          className="w-full border border-gray-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Address
                        </label>
                        <input
                          type="text"
                          value={newContactAddress}
                          onChange={(event) =>
                            setNewContactAddress(event.target.value)
                          }
                          placeholder="Enter address (optional)"
                          className="w-full border border-gray-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      {newContactError && (
                        <p className="text-sm text-red-700">
                          {newContactError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleCreateContact()}
                        disabled={savingContact}
                        className="bg-[#08294B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {savingContact ? "Saving..." : "Save Contact"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Information */}
            <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-base font-semibold text-[#08294B]">
                  Invoice Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the details of the invoice you want to archive.
                </p>
              </div>

              {/* Invoice Title */}
              <div>
                <label
                  htmlFor="invoice-title"
                  className="mb-1 block text-sm font-medium text-[#08294B]"
                >
                  Invoice Title *
                </label>
                <input
                  id="invoice-title"
                  type="text"
                  value={invoiceTitle}
                  onChange={(event) => setInvoiceTitle(event.target.value)}
                  placeholder="e.g. Engine Repair"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              {/* Invoice Number */}
              <div>
                <label
                  htmlFor="invoice-number"
                  className="mb-1 block text-sm font-medium text-[#08294B]"
                >
                  Invoice Number (Optional)
                </label>
                <input
                  id="invoice-number"
                  type="text"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              {/* Invoice Date */}
              <div>
                <label
                  htmlFor="invoice-date"
                  className="mb-1 block text-sm font-medium text-[#08294B]"
                >
                  Invoice Date *
                </label>
                <input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              {/* Invoice Amount */}
              <div>
                <label
                  htmlFor="invoice-amount"
                  className="mb-1 block text-sm font-medium text-[#08294B]"
                >
                  Amount (₦) — Optional
                </label>
                <input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(event) => setInvoiceAmount(event.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="invoice-description"
                  className="mb-1 block text-sm font-medium text-[#08294B]"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="invoice-description"
                  rows={3}
                  value={invoiceDescription}
                  onChange={(event) =>
                    setInvoiceDescription(event.target.value)
                  }
                  placeholder="Additional information about this invoice..."
                  className="w-full resize-y border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>
              {/* Invoice Attachments */}
              <div className="border-t border-gray-200 pt-4">
                <label
                  htmlFor="invoice-files"
                  className="mb-2 block text-sm font-medium text-[#08294B]"
                >
                  Invoice Attachments
                </label>

                <p className="mb-3 text-xs text-gray-500">
                  Upload PDF, JPG, PNG, or WebP files. Maximum 10 files, 10 MB
                  each.
                </p>

                <input
                  id="invoice-files"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);

                    if (files.length > 10) {
                      setInvoiceFormError(
                        "You can upload a maximum of 10 files.",
                      );
                      event.target.value = "";
                      setInvoiceFiles([]);
                      return;
                    }

                    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
                      setInvoiceFormError(
                        "Each file must be 10 MB or smaller.",
                      );
                      event.target.value = "";
                      setInvoiceFiles([]);
                      return;
                    }

                    setInvoiceFiles(files);
                    setInvoiceFormError(null);
                  }}
                  className="block w-full border border-gray-300 bg-white px-4 py-3 text-sm text-[#08294B] file:mr-4 file:border-0 file:bg-[#08294B] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#123D68]"
                />

                {invoiceFiles.length > 0 && (
                  <div className="mt-3 border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-[#08294B]">
                      Selected Files ({invoiceFiles.length})
                    </p>

                    <ul className="space-y-1">
                      {invoiceFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="break-all text-xs text-gray-600"
                        >
                          {index + 1}. {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {invoiceFormError && (
                  <p className="mt-2 text-sm text-red-700">
                    {invoiceFormError}
                  </p>
                )}
                {/* Save Invoice Button */}
                <div className="border-t border-gray-200 pt-5">
                  <button
                    type="button"
                    onClick={() => void handleSaveInvoice()}
                    disabled={savingInvoice}
                    className="w-full bg-[#08294B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#123D68] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingInvoice ? "Saving Invoice..." : "Save Invoice"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Popup */}
      {showInvoiceDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-[#08294B]">
                Invoice Details
              </h2>

              <div className="flex items-center gap-3">
                {selectedInvoice && !loadingInvoiceDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        setPreviewFileName("");
                      }

                      handleEditInvoice(selectedInvoice);
                    }}
                    className="border border-[#D19A24] bg-[#D19A24] px-4 py-2 text-sm font-semibold text-[#08294B] transition-colors hover:bg-[#E5B13C]"
                  >
                    Edit
                  </button>
                )}

                {selectedInvoice && !loadingInvoiceDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteInvoiceError(null);
                      setInvoiceToDelete(selectedInvoice);
                    }}
                    className="border border-[#6B1D1D] px-4 py-2 text-sm font-semibold text-[#6B1D1D] transition-colors hover:bg-[#6B1D1D] hover:text-white"
                  >
                    Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }

                    setPreviewUrl(null);
                    setPreviewFileName("");
                    setShowInvoiceDetails(false);
                    setSelectedInvoice(null);
                    setInvoiceDetailsError(null);
                  }}
                  className="text-sm text-gray-500 hover:text-[#08294B]"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Loading */}
            {loadingInvoiceDetails && (
              <p className="py-8 text-center text-gray-500">
                Loading invoice details...
              </p>
            )}

            {/* Error */}
            {invoiceDetailsError && (
              <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {invoiceDetailsError}
              </p>
            )}

            {/* Invoice Information */}
            {!loadingInvoiceDetails && selectedInvoice && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Invoice Title
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#08294B]">
                    {selectedInvoice.title}
                  </p>
                </div>

                <div className="grid gap-4 border-y border-gray-200 py-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium text-[#08294B]">
                      {selectedInvoice.invoice_number || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Invoice Date</p>
                    <p className="font-medium text-[#08294B]">
                      {formatDate(selectedInvoice.invoice_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-[#08294B]">
                      {selectedInvoice.amount == null
                        ? "Not provided"
                        : `₦${Number(selectedInvoice.amount).toLocaleString(
                            "en-NG",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Archive ID</p>
                    <p className="font-medium text-[#08294B]">
                      #{selectedInvoice.archive_id}
                    </p>
                  </div>
                </div>

                {selectedInvoice.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#08294B]">
                      {selectedInvoice.description}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="mb-3 text-base font-semibold text-[#08294B]">
                    Attachments ({selectedInvoice.files?.length ?? 0})
                  </h3>

                  {selectedInvoice.files?.length ? (
                    <div className="space-y-3">
                      {selectedInvoice.files.map((file) => (
                        <div
                          key={file.file_id}
                          className="flex items-center justify-between gap-4 border border-gray-200 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#08294B]">
                              {file.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.mime_type} ·{" "}
                              {(file.file_size / 1024).toFixed(1)} KB
                            </p>
                          </div>

                          {file.mime_type.startsWith("image/") && (
                            <button
                              type="button"
                              disabled={loadingPreview}
                              onClick={async () => {
                                try {
                                  setLoadingPreview(true);
                                  setInvoiceDetailsError(null);

                                  const url = await previewArchivedInvoiceFile(
                                    selectedInvoice.archive_id,
                                    file.file_id,
                                  );

                                  setPreviewUrl((previousUrl) => {
                                    if (previousUrl)
                                      URL.revokeObjectURL(previousUrl);
                                    return url;
                                  });

                                  setPreviewFileName(file.original_name);
                                } catch (error) {
                                  setInvoiceDetailsError(
                                    error instanceof Error
                                      ? error.message
                                      : "Unable to preview image.",
                                  );
                                } finally {
                                  setLoadingPreview(false);
                                }
                              }}
                              className="shrink-0 border border-[#D19A24] px-4 py-2 text-sm font-semibold text-[#08294B] hover:bg-[#D19A24] disabled:opacity-50"
                            >
                              {loadingPreview ? "Loading..." : "Preview"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await downloadArchivedInvoiceFile(
                                  selectedInvoice.archive_id,
                                  file.file_id,
                                  file.original_name,
                                );
                              } catch (error) {
                                console.error(
                                  "Attachment download failed:",
                                  error,
                                );

                                setInvoiceDetailsError(
                                  error instanceof Error
                                    ? error.message
                                    : "Unable to download attachment.",
                                );
                              }
                            }}
                            className="shrink-0 border border-[#08294B] px-4 py-2 text-sm font-semibold text-[#08294B] transition-colors hover:bg-[#08294B] hover:text-white"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No attachments found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Invoice Image Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
              <h3 className="truncate text-base font-semibold text-[#08294B]">
                {previewFileName}
              </h3>

              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setPreviewFileName("");
                }}
                className="shrink-0 border border-[#08294B] px-4 py-2 text-sm font-semibold text-[#08294B] hover:bg-[#08294B] hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Blob URL generated from an authenticated private-file request */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={previewFileName}
              className="min-h-0 max-h-[75dvh] w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Edit Invoice Popup */}
      {showEditInvoice && editingInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-[#08294B]">
                Edit Invoice
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowEditInvoice(false);
                  setEditingInvoice(null);
                  setEditInvoiceError(null);
                }}
                className="text-sm text-gray-500 hover:text-[#08294B]"
              >
                Close
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (event) => {
                event.preventDefault();

                if (!editingInvoice || savingInvoiceEdit) return;

                try {
                  setSavingInvoiceEdit(true);
                  setEditInvoiceError(null);

                  await updateArchivedInvoice(editingInvoice.archive_id, {
                    title: editInvoiceTitle.trim(),
                    invoice_number: editInvoiceNumber.trim(),
                    invoice_date: editInvoiceDate,
                    amount: editInvoiceAmount.trim(),
                    description: editInvoiceDescription.trim(),
                  });

                  setShowEditInvoice(false);
                  setEditingInvoice(null);

                  // Reload the invoice table with updated information.
                  setRefreshKey((previous) => previous + 1);
                } catch (error) {
                  console.error("Failed to update invoice:", error);

                  setEditInvoiceError(
                    error instanceof Error
                      ? error.message
                      : "Unable to save invoice changes.",
                  );
                } finally {
                  setSavingInvoiceEdit(false);
                }
              }}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="edit-invoice-title"
                  className="mb-2 block text-sm font-medium text-[#08294B]"
                >
                  Invoice Title *
                </label>
                <input
                  id="edit-invoice-title"
                  type="text"
                  required
                  value={editInvoiceTitle}
                  onChange={(event) => setEditInvoiceTitle(event.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-invoice-number"
                    className="mb-2 block text-sm font-medium text-[#08294B]"
                  >
                    Invoice Number
                  </label>
                  <input
                    id="edit-invoice-number"
                    type="text"
                    value={editInvoiceNumber}
                    onChange={(event) =>
                      setEditInvoiceNumber(event.target.value)
                    }
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-invoice-date"
                    className="mb-2 block text-sm font-medium text-[#08294B]"
                  >
                    Invoice Date *
                  </label>
                  <input
                    id="edit-invoice-date"
                    type="date"
                    required
                    value={editInvoiceDate}
                    onChange={(event) => setEditInvoiceDate(event.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-invoice-amount"
                  className="mb-2 block text-sm font-medium text-[#08294B]"
                >
                  Amount (₦)
                </label>
                <input
                  id="edit-invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editInvoiceAmount}
                  onChange={(event) => setEditInvoiceAmount(event.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-invoice-description"
                  className="mb-2 block text-sm font-medium text-[#08294B]"
                >
                  Notes
                </label>
                <textarea
                  id="edit-invoice-description"
                  rows={4}
                  value={editInvoiceDescription}
                  onChange={(event) =>
                    setEditInvoiceDescription(event.target.value)
                  }
                  className="w-full resize-y border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#D19A24]"
                />
              </div>

              {editInvoiceError && (
                <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {editInvoiceError}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditInvoice(false);
                    setEditingInvoice(null);
                    setEditInvoiceError(null);
                  }}
                  className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingInvoiceEdit}
                  className="bg-[#08294B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123D68] disabled:opacity-50"
                >
                  {savingInvoiceEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Popup */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#6B1D1D]">
              Delete Invoice?
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Are you sure you want to permanently delete this invoice?
            </p>

            <div className="mt-4 border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-[#08294B]">
                {invoiceToDelete.title}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Invoice Number:{" "}
                {invoiceToDelete.invoice_number || "Not provided"}
              </p>
            </div>

            <p className="mt-4 text-sm font-medium text-[#6B1D1D]">
              This action cannot be undone.
            </p>

            {deleteInvoiceError && (
              <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteInvoiceError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingInvoice}
                onClick={() => {
                  setInvoiceToDelete(null);
                  setDeleteInvoiceError(null);
                }}
                className="border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingInvoice}
                onClick={async () => {
                  if (!invoiceToDelete || deletingInvoice) return;

                  try {
                    setDeletingInvoice(true);
                    setDeleteInvoiceError(null);

                    await deleteArchivedInvoice(invoiceToDelete.archive_id);

                    // Close the confirmation and details popups.
                    setInvoiceToDelete(null);
                    setShowInvoiceDetails(false);
                    setSelectedInvoice(null);
                    setInvoiceDetailsError(null);

                    // Refresh the invoice table.
                    setRefreshKey((previous) => previous + 1);
                  } catch (error) {
                    console.error("Failed to delete invoice:", error);

                    setDeleteInvoiceError(
                      error instanceof Error
                        ? error.message
                        : "Unable to delete invoice.",
                    );
                  } finally {
                    setDeletingInvoice(false);
                  }
                }}
                className="bg-[#6B1D1D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#842929] disabled:opacity-50"
              >
                {deletingInvoice ? "Deleting..." : "Delete Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOMERS
      ===================================================== */}

      {/* =====================================================
          SUPPLIERS
      ===================================================== */}
    </div>
  );
}
