"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";

import { getCurrentUser, logout } from "@/lib/api/auth";

import {
  deleteMyCarSaleSubmission,
  getMyCarSaleSubmissions,
  type CarSaleSubmission,
} from "@/lib/api/car-sale-submissions";

import type { Customer } from "@/types/auth";

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [submissions, setSubmissions] = useState<CarSaleSubmission[]>([]);

  const [loading, setLoading] = useState(true);

  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  const [deletingSubmissionId, setDeletingSubmissionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await getCurrentUser();

        if (!active) {
          return;
        }

        if (response.data.accountType !== "customer") {
          router.replace("/login");
          return;
        }

        setCustomer(response.data.customer);

        setLoading(false);

        try {
          setSubmissionsLoading(true);

          const submissionResponse = await getMyCarSaleSubmissions();

          if (!active) {
            return;
          }

          setSubmissions(submissionResponse.data ?? []);
        } catch (submissionError) {
          if (!active) {
            return;
          }

          setError(
            submissionError instanceof Error
              ? submissionError.message
              : "We could not load your car submissions.",
          );
        } finally {
          if (active) {
            setSubmissionsLoading(false);
          }
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not log you out. Please try again.",
      );

      setLoggingOut(false);
    }
  }

  async function handleDeleteSubmission(submissionId: number) {
    const confirmed = window.confirm(
      "Delete this vehicle submission?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setDeletingSubmissionId(submissionId);

      await deleteMyCarSaleSubmission(submissionId);

      setSubmissions((current) =>
        current.filter(
          (submission) => submission.submission_id !== submissionId,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not delete this submission. Please try again.",
      );
    } finally {
      setDeletingSubmissionId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar solid />

        <main className="min-h-screen bg-[#F7F7F5] pt-20 lg:pt-24">
          <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:px-12">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-200" />

              <div className="mt-4 h-10 w-72 bg-gray-200" />

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                <div className="h-48 bg-white" />
                <div className="h-48 bg-white" />
                <div className="h-48 bg-white" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!customer) {
    return null;
  }

  const fullName = `${customer.first_name} ${customer.last_name}`.trim();

  return (
    <>
      <Navbar solid />

      <main className="min-h-screen bg-[#F7F7F5] pt-20 lg:pt-24">
        {/* WELCOME */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D19A24]">
              My Account
            </p>

            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[#08294B] sm:text-4xl">
                  Welcome, {customer.first_name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  Manage your vehicle submissions, service appointments and
                  account information from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex h-11 w-fit items-center justify-center gap-2 border border-gray-300 bg-white px-5 text-sm font-semibold text-[#6B1D1D] transition hover:border-[#6B1D1D] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={17} />

                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>

            {error && (
              <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
          {/* MAIN ACTIONS */}
          <section>
            <div className="grid gap-5 md:grid-cols-2">
              <Link
                href="/sell-your-car"
                className="group border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#08294B] text-white">
                    <CarFront size={23} />
                  </div>

                  <ChevronRight
                    size={21}
                    className="text-[#6B7280] transition duration-300 group-hover:translate-x-1 group-hover:text-[#D19A24]"
                  />
                </div>

                <h2 className="mt-6 text-xl font-bold text-[#08294B]">
                  Sell Your Car
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Submit another vehicle to Unique Mechanical Works for review.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#D19A24]">
                  <Plus size={17} />
                  New submission
                </div>
              </Link>

              <Link
                href="/book-appointment"
                className="group border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#08294B] text-white">
                    <CalendarDays size={23} />
                  </div>

                  <ChevronRight
                    size={21}
                    className="text-[#6B7280] transition duration-300 group-hover:translate-x-1 group-hover:text-[#D19A24]"
                  />
                </div>

                <h2 className="mt-6 text-xl font-bold text-[#08294B]">
                  Book a Service
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Schedule your next vehicle service with our mechanical team.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#D19A24]">
                  <Plus size={17} />
                  Book appointment
                </div>
              </Link>
            </div>
          </section>

          {/* CAR SUBMISSIONS */}
          <section className="mt-10 border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CarFront size={21} className="text-[#D19A24]" />

                  <h2 className="text-lg font-bold text-[#08294B]">
                    My Car Submissions
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#6B7280]">
                  Track vehicles you&apos;ve submitted to UMW for review.
                </p>
              </div>

              <Link
                href="/sell-your-car"
                className="inline-flex h-10 w-fit items-center justify-center gap-2 bg-[#08294B] px-4 text-sm font-bold text-white transition hover:bg-[#061f39]"
              >
                <Plus size={16} />
                Submit another car
              </Link>
            </div>

            {submissionsLoading ? (
              <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse border border-gray-200 p-5"
                  >
                    <div className="h-5 w-32 bg-gray-200" />
                    <div className="mt-3 h-4 w-20 bg-gray-100" />
                    <div className="mt-8 h-8 w-24 bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#F7F7F5] text-[#D19A24]">
                  <CarFront size={23} />
                </div>

                <h3 className="mt-5 font-heading text-xl font-bold text-[#08294B]">
                  No vehicle submissions yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                  When you submit a vehicle to UMW, its review status will
                  appear here.
                </p>

                <Link
                  href="/sell-your-car"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#08294B] transition hover:text-[#D19A24]"
                >
                  Sell your car
                  <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.submission_id}
                    submission={submission}
                    deleting={deletingSubmissionId === submission.submission_id}
                    onDelete={handleDeleteSubmission}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ACCOUNT / APPOINTMENTS */}
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <CalendarDays size={20} className="text-[#D19A24]" />

                  <h2 className="text-lg font-bold text-[#08294B]">
                    Appointments
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#6B7280]">
                  Your service appointments will be available here.
                </p>
              </div>

              <div className="p-6">
                <p className="text-sm leading-6 text-[#6B7280]">
                  You can schedule your vehicle with the UMW mechanical team
                  from your account.
                </p>

                <Link
                  href="/book-appointment"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08294B] transition hover:text-[#D19A24]"
                >
                  Book service
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* PROFILE */}
            <aside className="border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <UserRound size={20} className="text-[#D19A24]" />

                  <h2 className="text-lg font-bold text-[#08294B]">Profile</h2>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#08294B]">
                    {fullName}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Phone size={15} />

                    <p className="text-xs font-bold uppercase tracking-[0.12em]">
                      Phone
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-[#08294B]">
                    {customer.phone}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Mail size={15} />

                    <p className="text-xs font-bold uppercase tracking-[0.12em]">
                      Email
                    </p>
                  </div>

                  <p className="mt-1 break-words text-sm font-semibold text-[#08294B]">
                    {customer.email ?? "Not provided"}
                  </p>
                </div>

                {customer.address && (
                  <div>
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <MapPin size={15} />

                      <p className="text-xs font-bold uppercase tracking-[0.12em]">
                        Address
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-semibold leading-6 text-[#08294B]">
                      {customer.address}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function SubmissionCard({
  submission,
  deleting,
  onDelete,
}: {
  submission: CarSaleSubmission;
  deleting: boolean;
  onDelete: (submissionId: number) => void;
}) {
  const price =
    submission.expected_price !== null
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(submission.expected_price)
      : "Price not provided";

  const submittedDate = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(submission.created_at));

  return (
    <article className="border border-gray-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">
            Submission #{submission.submission_id}
          </p>

          <h3 className="mt-2 font-heading text-xl font-bold text-[#08294B]">
            {submission.make} {submission.model}
          </h3>

          <p className="mt-1 text-sm text-[#6B7280]">
            {submission.year ?? "Year not provided"}
          </p>
        </div>

        <StatusBadge status={submission.status} />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-lg font-bold text-[#08294B]">{price}</p>

        <p className="mt-2 text-xs text-[#6B7280]">Submitted {submittedDate}</p>
      </div>

      <div className="mt-5">
        <StatusMessage submission={submission} />
      </div>

      {submission.status === "pending" && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(submission.submission_id)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B1D1D] transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />

            {deleting ? "Deleting..." : "Delete submission"}
          </button>
        </div>
      )}
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-green-700">
        <CheckCircle2 size={14} />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#6B1D1D]">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 border border-[#D19A24]/30 bg-[#D19A24]/10 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8A6416]">
      <Clock3 size={14} />
      Pending
    </span>
  );
}

function StatusMessage({ submission }: { submission: CarSaleSubmission }) {
  if (submission.status === "approved") {
    return (
      <div className="border-l-2 border-green-600 pl-3">
        <p className="text-sm font-semibold text-green-800">
          Your vehicle has been approved for the next step.
        </p>

        <p className="mt-1 text-xs leading-5 text-[#6B7280]">
          A member of the Unique Mechanical Works team will contact you using
          the phone number provided to discuss the vehicle, request any
          additional information or photos, and arrange an inspection if
          required. Your vehicle is not publicly listed yet.
        </p>
      </div>
    );
  }

  if (submission.status === "rejected") {
    return (
      <div className="border-l-2 border-[#6B1D1D] pl-3">
        <p className="text-sm font-semibold text-[#6B1D1D]">
          This submission was not approved.
        </p>

        {submission.admin_notes && (
          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            UMW note: {submission.admin_notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-l-2 border-[#D19A24] pl-3">
      <p className="text-sm font-semibold text-[#08294B]">
        Waiting for UMW review
      </p>

      <p className="mt-1 text-xs leading-5 text-[#6B7280]">
        Your submission has been received and is currently pending review.
      </p>
    </div>
  );
}
