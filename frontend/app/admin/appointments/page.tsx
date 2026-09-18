import { CalendarDays } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";

export default function AdminAppointmentsPage() {
  return (
    <AdminModulePage
      eyebrow="Workshop Operations"
      title="Appointments"
      description="Review, confirm and manage customer service appointments across UMW branches."
      icon={CalendarDays}
    >
      <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
        <p className="font-heading text-2xl font-bold text-prussian">
          Customer appointments will appear here.
        </p>
      </div>
    </AdminModulePage>
  );
}