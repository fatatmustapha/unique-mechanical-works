import { MessageSquareQuote } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";

export default function AdminTestimonialsPage() {
  return (
    <AdminModulePage
      eyebrow="Website Content"
      title="Testimonials"
      description="Review and moderate customer testimonials before they appear publicly on the UMW website."
      icon={MessageSquareQuote}
    >
      <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
        <p className="font-heading text-2xl font-bold text-prussian">
          Customer testimonials will appear here.
        </p>
      </div>
    </AdminModulePage>
  );
}