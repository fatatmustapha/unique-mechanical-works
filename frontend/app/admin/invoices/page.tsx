import { FileText } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";

export default function AdminInvoicesPage() {
  return (
    <AdminModulePage
      eyebrow="Financial Records"
      title="Invoices"
      description="Review and manage customer invoices issued by Unique Mechanical Works."
      icon={FileText}
    >
      <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
        <p className="font-heading text-2xl font-bold text-prussian">
          Invoice records will appear here.
        </p>
      </div>
    </AdminModulePage>
  );
}