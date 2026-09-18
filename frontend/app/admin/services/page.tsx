import { Wrench } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";

export default function AdminServicesPage() {
  return (
    <AdminModulePage
      eyebrow="Workshop Management"
      title="Services"
      description="Manage UMW services, pricing and branch availability."
      icon={Wrench}
    >
      <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
        <p className="font-heading text-2xl font-bold text-prussian">
          Service management will appear here.
        </p>
      </div>
    </AdminModulePage>
  );
}