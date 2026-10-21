import { FileText } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import InvoiceArchiveManager from "@/components/admin/invoices/InvoiceArchiveManager";

export default function AdminInvoicesPage() {
  return (
    <AdminModulePage
      eyebrow="Financial Records"
      title="Invoice Management"
      description="Organize and retrieve invoices for customers, walk-in customers, and suppliers."
      icon={FileText}
    >
      <InvoiceArchiveManager />
    </AdminModulePage>
  );
}