"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  CircleDollarSign,
  Fuel,
  Gauge,
  LoaderCircle,
  MessageSquareText,
  Palette,
  Phone,
  Settings2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminCarSaleSubmission,
  reviewAdminCarSaleSubmission,
  type CarSaleSubmission,
} from "@/lib/api/car-sale-submissions";

type CarSubmissionReviewProps = {
  submissionId: number;
};

const formatPrice = (
  price: number | null,
) => {
  if (price === null) {
    return "Not provided";
  }

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(price);
};

const formatMileage = (
  mileage: number | null,
) => {
  if (mileage === null) {
    return "Not provided";
  }

  return `${new Intl.NumberFormat(
    "en-NG",
  ).format(mileage)} km`;
};

const formatDate = (
  value: string | null | undefined,
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
};

const statusClasses = (
  status: CarSaleSubmission["status"],
) => {
  switch (status) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

type DetailItemProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

function DetailItem({
  label,
  value,
  icon,
}: DetailItemProps) {
  return (
    <div className="border border-prussian/10 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-prussian/5 text-bronze">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-prussian">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CarSubmissionReview({
  submissionId,
}: CarSubmissionReviewProps) {
  const router = useRouter();

  const [
    submission,
    setSubmission,
  ] =
    useState<CarSaleSubmission | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    adminNotes,
    setAdminNotes,
  ] = useState("");

  const [
    reviewing,
    setReviewing,
  ] = useState<
    "approved" | "rejected" | null
  >(null);

  const loadSubmission =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getAdminCarSaleSubmission(
            submissionId,
          );

        const loadedSubmission =
          response.data.submission;

        setSubmission(
          loadedSubmission,
        );

        setAdminNotes(
          loadedSubmission.admin_notes ??
            "",
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to retrieve this submission.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [submissionId]);

  useEffect(() => {
    void loadSubmission();
  }, [loadSubmission]);

  const handleReview = async (
    decision: "approved" | "rejected",
  ) => {
    if (!submission) {
      return;
    }

    const vehicleName =
      `${submission.make} ${submission.model}`;

    const confirmed =
      window.confirm(
        decision === "approved"
          ? `Approve ${vehicleName}?\n\nA new draft vehicle will be created in Vehicle Management. You can review and edit it before publishing.`
          : `Reject ${vehicleName}?\n\nThe submission will remain in the system as rejected.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setReviewing(decision);

      const response =
        await reviewAdminCarSaleSubmission(
          submission.submission_id,
          {
            decision,
            admin_notes:
              adminNotes.trim() ||
              null,
          },
        );

      setSubmission(
        response.data.submission,
      );

      setAdminNotes(
        response.data.submission
          .admin_notes ?? "",
      );

      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to review this submission.";

      window.alert(message);
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center border border-prussian/10 bg-white">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-bronze"
          />

          <p className="mt-4 text-sm font-medium text-slate">
            Loading submission...
          </p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="border border-red-200 bg-red-50 px-6 py-12 text-center">
        <h2 className="font-heading text-2xl font-bold text-red-800">
          Unable to load submission
        </h2>

        <p className="mt-3 text-sm text-red-700">
          {error ??
            "The requested submission could not be found."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              void loadSubmission()
            }
            className="bg-prussian px-5 py-3 text-sm font-bold text-white transition hover:bg-prussian/90"
          >
            Try Again
          </button>

          <Link
            href="/admin/car-submissions"
            className="border border-prussian/15 bg-white px-5 py-3 text-sm font-bold text-prussian transition hover:border-bronze hover:text-bronze"
          >
            Back to Submissions
          </Link>
        </div>
      </div>
    );
  }

  const isPending =
    submission.status === "pending";

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-prussian/10 pb-7 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/car-submissions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate transition hover:text-bronze"
          >
            <ArrowLeft size={16} />
            Back to Car Submissions
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-3xl font-bold text-prussian">
              {submission.make}{" "}
              {submission.model}
            </h2>

            <span
              className={`inline-flex border px-3 py-1 text-xs font-bold capitalize ${statusClasses(
                submission.status,
              )}`}
            >
              {submission.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate">
            Submission #
            {submission.submission_id} ·
            Submitted{" "}
            {formatDate(
              submission.created_at,
            )}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-prussian text-white">
          <CarFront size={27} />
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-bronze">
            Vehicle Information
          </p>

          <h3 className="mt-2 font-heading text-2xl font-bold text-prussian">
            Vehicle Details
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Year"
            value={
              submission.year?.toString() ??
              "Not provided"
            }
            icon={
              <CalendarDays size={18} />
            }
          />

          <DetailItem
            label="Mileage"
            value={formatMileage(
              submission.mileage,
            )}
            icon={<Gauge size={18} />}
          />

          <DetailItem
            label="Condition"
            value={
              submission.condition_type ??
              "Not provided"
            }
            icon={<CarFront size={18} />}
          />

          <DetailItem
            label="Transmission"
            value={
              submission.transmission ??
              "Not provided"
            }
            icon={
              <Settings2 size={18} />
            }
          />

          <DetailItem
            label="Fuel Type"
            value={
              submission.fuel_type ??
              "Not provided"
            }
            icon={<Fuel size={18} />}
          />

          <DetailItem
            label="Exterior Color"
            value={
              submission.color_exterior ??
              "Not provided"
            }
            icon={<Palette size={18} />}
          />

          <DetailItem
            label="Expected Price"
            value={formatPrice(
              submission.expected_price,
            )}
            icon={
              <CircleDollarSign
                size={18}
              />
            }
          />

          <DetailItem
  label="Branch"
  value={
    submission.branch_name ??
    "Not provided"
  }
  icon={
    <Building2 size={18} />
  }
/>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="border border-prussian/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <MessageSquareText
              size={21}
              className="text-bronze"
            />

            <h3 className="font-heading text-xl font-bold text-prussian">
              Customer Description
            </h3>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate">
            {submission.description ||
              "The customer did not provide a description for this vehicle."}
          </p>
        </section>

        <section className="border border-prussian/10 bg-white p-6">
          <h3 className="font-heading text-xl font-bold text-prussian">
            Seller Contact
          </h3>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
              Phone Number
            </p>

            {submission.contact_phone ? (
              <a
                href={`tel:${submission.contact_phone}`}
                className="mt-2 inline-flex items-center gap-2 text-base font-bold text-prussian transition hover:text-bronze"
              >
                <Phone
                  size={17}
                  className="text-bronze"
                />

                {
                  submission.contact_phone
                }
              </a>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate">
                Not provided
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-prussian/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
              Customer ID
            </p>

            <p className="mt-2 text-sm font-semibold text-prussian">
              #{submission.customer_id}
            </p>
          </div>
        </section>
      </div>

      {isPending ? (
        <section className="mt-8 border border-prussian/10 bg-white p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-bronze">
              Admin Review
            </p>

            <h3 className="mt-2 font-heading text-2xl font-bold text-prussian">
              Review This Submission
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate">
              Add internal notes if
              needed, then approve or
              reject the vehicle.
              Approving it will create a
              draft vehicle in Vehicle
              Management. It will not be
              published automatically.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="admin-notes"
              className="text-sm font-bold text-prussian"
            >
              Internal Admin Notes
            </label>

            <textarea
              id="admin-notes"
              rows={6}
              maxLength={1000}
              value={adminNotes}
              disabled={
                reviewing !== null
              }
              onChange={(event) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              placeholder="Write any internal notes about the vehicle, its condition, price, customer discussion, or review decision..."
              className="mt-2 w-full resize-y border border-prussian/15 bg-white px-4 py-3 text-sm leading-6 text-prussian outline-none transition placeholder:text-slate/60 focus:border-bronze disabled:bg-slate-50"
            />

            <p className="mt-2 text-right text-xs text-slate">
              {adminNotes.length}/1000
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-prussian/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={
                reviewing !== null
              }
              onClick={() =>
                void handleReview(
                  "rejected",
                )
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-red-200 px-6 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewing ===
              "rejected" ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <X size={18} />
              )}

              Reject Submission
            </button>

            <button
              type="button"
              disabled={
                reviewing !== null
              }
              onClick={() =>
                void handleReview(
                  "approved",
                )
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewing ===
              "approved" ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Check size={18} />
              )}

              Approve Vehicle
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-8 border border-prussian/10 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-prussian/5">
              {submission.status ===
              "approved" ? (
                <BadgeCheck
                  size={23}
                  className="text-green-700"
                />
              ) : (
                <X
                  size={23}
                  className="text-red-700"
                />
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-bronze">
                Review Complete
              </p>

              <h3 className="mt-2 font-heading text-2xl font-bold text-prussian">
                {submission.status ===
                "approved"
                  ? "Submission Approved"
                  : "Submission Rejected"}
              </h3>

              <p className="mt-2 text-sm text-slate">
                Reviewed{" "}
                {formatDate(
                  submission.reviewed_at,
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-prussian/10 pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
              Internal Admin Notes
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-prussian">
              {submission.admin_notes ||
                "No internal notes were added."}
            </p>
          </div>

          {submission.status ===
            "approved" &&
            submission.approved_car_id !==
              null && (
              <div className="mt-6 border-t border-prussian/10 pt-6">
                <p className="mb-3 text-sm text-slate">
                  This submission has
                  been converted into a
                  draft inventory
                  vehicle.
                </p>

                <Link
                  href={`/admin/vehicles/${submission.approved_car_id}/edit`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-bronze px-6 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c]"
                >
                  <CarFront size={18} />
                  Go to Vehicle Draft
                </Link>
              </div>
            )}
        </section>
      )}
    </div>
  );
}