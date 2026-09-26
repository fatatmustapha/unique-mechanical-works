import { Store } from "lucide-react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import CarSubmissionReview from "@/components/admin/CarSubmissionReview";

type AdminCarSubmissionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminCarSubmissionPage({
  params,
}: AdminCarSubmissionPageProps) {
  const { id } = await params;

  const submissionId =
    Number(id);

  if (
    !Number.isInteger(submissionId) ||
    submissionId <= 0
  ) {
    return (
      <AdminModulePage
        eyebrow="Customer Vehicles"
        title="Review Submission"
        description="Review customer vehicle details and decide whether the vehicle should be added to the Unique Mechanical Works inventory."
        icon={Store}
      >
        <div className="border border-red-200 bg-red-50 px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-red-800">
            Invalid submission
          </h2>

          <p className="mt-3 text-sm text-red-700">
            The requested submission ID
            is not valid.
          </p>
        </div>
      </AdminModulePage>
    );
  }

  return (
    <AdminModulePage
      eyebrow="Customer Vehicles"
      title="Review Submission"
      description="Review the submitted vehicle information, contact details and internal notes before approving or rejecting the vehicle."
      icon={Store}
    >
      <CarSubmissionReview
        submissionId={submissionId}
      />
    </AdminModulePage>
  );
}