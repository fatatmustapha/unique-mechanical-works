"use client";

import Link from "next/link";

import {
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  LoaderCircle,
  Phone,
  Store,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminModulePage from "@/components/admin/AdminModulePage";
import AdminSelect from "@/components/admin/AdminSelect";

import {
  getAdminCarSaleSubmissions,
  type CarSaleSubmission,
  type CarSaleSubmissionStatus,
} from "@/lib/api/car-sale-submissions";

type StatusFilter =
  | ""
  | CarSaleSubmissionStatus;

const statusOptions = [
  {
    value: "",
    label: "All Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

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

const formatDate = (
  value: string,
) => {
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
    },
  ).format(date);
};

const statusClasses = (
  status: CarSaleSubmissionStatus,
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

export default function AdminCarSubmissionsPage() {
  const [
    submissions,
    setSubmissions,
  ] = useState<CarSaleSubmission[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    status,
    setStatus,
  ] = useState<StatusFilter>("");

  const [page, setPage] =
    useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadSubmissions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getAdminCarSaleSubmissions(
            {
              status:
                status ||
                undefined,
              page,
              limit: 20,
            },
          );

        setSubmissions(
          response.data.submissions,
        );

        setPagination(
          response.data.pagination,
        );
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to retrieve car submissions.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }, [page, status]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  return (
    <AdminModulePage
      eyebrow="Customer Vehicles"
      title="Car Submissions"
      description="Review vehicles submitted by customers who would like to sell their cars through Unique Mechanical Works."
      icon={Store}
    >
      <div className="flex flex-col gap-5 border-b border-prussian/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-prussian">
            Customer Submissions
          </h2>

          <p className="mt-2 text-sm text-slate">
            {pagination.total === 1
              ? "1 vehicle submission found."
              : `${pagination.total} vehicle submissions found.`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate">
          <Clock3
            size={17}
            className="text-bronze"
          />

          Pending submissions should be
          reviewed before adding them to
          inventory.
        </div>
      </div>

      <div className="mt-8 border border-prussian/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">
              Filter submissions
            </p>

            <p className="mt-1 text-sm text-slate">
              View all submissions or
              filter by review status.
            </p>
          </div>

          <AdminSelect
            value={status}
            options={statusOptions}
            ariaLabel="Filter submissions by status"
            className="sm:w-[210px]"
            onChange={(value) => {
              setPage(1);

              setStatus(
                value as StatusFilter,
              );
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-72 items-center justify-center border border-prussian/10 bg-white">
          <div className="text-center">
            <LoaderCircle
              size={34}
              className="mx-auto animate-spin text-bronze"
            />

            <p className="mt-4 text-sm font-medium text-slate">
              Loading customer
              submissions...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 border border-red-200 bg-red-50 px-6 py-10 text-center">
          <h3 className="font-heading text-xl font-bold text-red-800">
            Unable to load submissions
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadSubmissions()
            }
            className="mt-5 bg-prussian px-5 py-3 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="mt-6 border border-prussian/10 bg-white px-6 py-16 text-center">
          <Store
            size={38}
            className="mx-auto text-bronze"
          />

          <h3 className="mt-5 font-heading text-2xl font-bold text-prussian">
            No submissions found
          </h3>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate">
            {status
              ? `There are currently no ${status} vehicle submissions.`
              : "Customers have not submitted any vehicles for sale yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto border border-prussian/10 bg-white lg:block">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="border-b border-prussian/10 bg-prussian/[0.035]">
                <tr className="text-xs font-bold uppercase tracking-[0.12em] text-slate">
                  <th className="px-5 py-4">
                    Vehicle
                  </th>

                  <th className="px-5 py-4">
                    Branch
                  </th>

                  <th className="px-5 py-4">
                    Expected Price
                  </th>

                  <th className="px-5 py-4">
                    Contact
                  </th>

                  <th className="px-5 py-4">
                    Submitted
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {submissions.map(
                  (submission) => (
                    <tr
                      key={
                        submission.submission_id
                      }
                      className="border-b border-prussian/10 transition-colors last:border-b-0 hover:bg-prussian/[0.02]"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-prussian/5 text-prussian">
                            <CarFront
                              size={21}
                            />
                          </div>

                          <div>
                            <p className="font-bold text-prussian">
                              {
                                submission.make
                              }{" "}
                              {
                                submission.model
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate">
                              {submission.year ??
                                "Year not specified"}

                              {submission.condition_type
                                ? ` · ${submission.condition_type}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate">
                        {
                          submission.branch_name
                        }
                      </td>

                      <td className="px-5 py-5 text-sm font-bold text-prussian">
                        {formatPrice(
                          submission.expected_price,
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {submission.contact_phone ? (
                          <a
                            href={`tel:${submission.contact_phone}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-prussian transition hover:text-bronze"
                          >
                            <Phone
                              size={15}
                            />

                            {
                              submission.contact_phone
                            }
                          </a>
                        ) : (
                          <span className="text-sm text-slate">
                            Not provided
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate">
                        {formatDate(
                          submission.created_at,
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex border px-2.5 py-1 text-xs font-bold capitalize ${statusClasses(
                            submission.status,
                          )}`}
                        >
                          {
                            submission.status
                          }
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/car-submissions/${submission.submission_id}`}
                            className="inline-flex min-h-9 items-center justify-center gap-2 border border-prussian/15 px-3 text-xs font-bold text-prussian transition hover:border-bronze hover:text-bronze"
                          >
                            <Eye
                              size={15}
                            />

                            {submission.status ===
                            "pending"
                              ? "Review"
                              : "View"}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="mt-6 space-y-4 lg:hidden">
            {submissions.map(
              (submission) => (
                <article
                  key={
                    submission.submission_id
                  }
                  className="border border-prussian/10 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-prussian">
                        {submission.make}{" "}
                        {submission.model}
                      </h3>

                      <p className="mt-1 text-xs text-slate">
                        Submission #
                        {
                          submission.submission_id
                        }
                      </p>
                    </div>

                    <CarFront
                      size={25}
                      className="shrink-0 text-bronze"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate">
                        Year
                      </p>

                      <p className="mt-1 font-semibold text-prussian">
                        {submission.year ??
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate">
                        Branch
                      </p>

                      <p className="mt-1 font-semibold text-prussian">
                        {
                          submission.branch_name
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate">
                        Expected Price
                      </p>

                      <p className="mt-1 font-bold text-prussian">
                        {formatPrice(
                          submission.expected_price,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate">
                        Submitted
                      </p>

                      <p className="mt-1 font-semibold text-prussian">
                        {formatDate(
                          submission.created_at,
                        )}
                      </p>
                    </div>
                  </div>

                  {submission.contact_phone && (
                    <a
                      href={`tel:${submission.contact_phone}`}
                      className="mt-5 flex items-center gap-2 text-sm font-semibold text-prussian transition hover:text-bronze"
                    >
                      <Phone
                        size={15}
                        className="text-bronze"
                      />

                      {
                        submission.contact_phone
                      }
                    </a>
                  )}

                  <div className="mt-5">
                    <span
                      className={`inline-flex border px-2.5 py-1 text-xs font-bold capitalize ${statusClasses(
                        submission.status,
                      )}`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <Link
                    href={`/admin/car-submissions/${submission.submission_id}`}
                    className="mt-5 flex min-h-10 w-full items-center justify-center gap-2 border border-prussian/15 text-sm font-semibold text-prussian transition hover:border-bronze hover:text-bronze"
                  >
                    <Eye size={15} />

                    {submission.status ===
                    "pending"
                      ? "Review Submission"
                      : "View Submission"}
                  </Link>
                </article>
              ),
            )}
          </div>

          {pagination.totalPages >
            1 && (
            <div className="mt-6 flex flex-col gap-4 border border-prussian/10 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate">
                Page{" "}
                <span className="font-bold text-prussian">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-prussian">
                  {
                    pagination.totalPages
                  }
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        current - 1,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 border border-prussian/15 px-4 text-sm font-semibold text-prussian transition hover:border-bronze disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 border border-prussian/15 px-4 text-sm font-semibold text-prussian transition hover:border-bronze disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminModulePage>
  );
}