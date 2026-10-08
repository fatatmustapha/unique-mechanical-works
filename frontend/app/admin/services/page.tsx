import { Wrench } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import ServiceShowcaseManager from "@/components/admin/ServiceShowcaseManager";

export default function AdminServicesPage() {
  return (
    <AdminModulePage
      eyebrow="Workshop Management"
      title="Services"
      description="Manage UMW services and showcase completed workshop projects."
      icon={Wrench}
    >
      <div className="space-y-10">
        <section className="border border-prussian/10 bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-bronze">
            Service Management
          </p>

          <h2 className="mt-1 font-heading text-2xl font-bold text-prussian">
            Manage Services
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
            Manage the services offered by Unique Mechanical
            Works, including branch availability and pricing.
          </p>

          <div className="mt-6 border border-dashed border-prussian/15 px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate">
              Service management controls will be added here
              next.
            </p>
          </div>
        </section>

        <ServiceShowcaseManager />
      </div>
    </AdminModulePage>
  );
}