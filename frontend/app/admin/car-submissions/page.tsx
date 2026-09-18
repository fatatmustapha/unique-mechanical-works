import { Store } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";

export default function AdminCarSubmissionsPage() {
  return (
    <AdminModulePage
      eyebrow="Customer Vehicles"
      title="Car Submissions"
      description="Review vehicles submitted by customers who want to sell their cars through Unique Mechanical Works."
      icon={Store}
    >
      <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
        <p className="font-heading text-2xl font-bold text-prussian">
          Car submissions will appear here.
        </p>
      </div>
    </AdminModulePage>
  );
}