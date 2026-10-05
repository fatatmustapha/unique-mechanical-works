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
  cancelMyAppointment,
  hideMyCancelledAppointment,
  getMyAppointments,
  rescheduleMyAppointment,
} from "@/lib/api/appointments";

import CustomerSelect from "@/components/customer/CustomerSelect";

import type { Appointment } from "@/types/appointment";

import {
  deleteMyCarSaleSubmission,
  getMyCarSaleSubmissions,
  type CarSaleSubmission,
} from "@/lib/api/car-sale-submissions";

import type { Customer } from "@/types/auth";

const rescheduleMonthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const rescheduleCurrentYear = new Date().getFullYear();

const rescheduleYearOptions = [
  {
    value: rescheduleCurrentYear.toString(),
    label: rescheduleCurrentYear.toString(),
  },
  {
    value: (rescheduleCurrentYear + 1).toString(),
    label: (rescheduleCurrentYear + 1).toString(),
  },
];

const rescheduleHourOptions = [
  { value: "08", label: "08" },
  { value: "09", label: "09" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
];

const rescheduleMinuteOptions = [
  { value: "00", label: "00" },
  { value: "15", label: "15" },
  { value: "30", label: "30" },
  { value: "45", label: "45" },
];

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [submissions, setSubmissions] = useState<CarSaleSubmission[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<
    number | null
  >(null);

  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<
    number | null
  >(null);

  const [rescheduleDate, setRescheduleDate] = useState("");

  const [rescheduleTime, setRescheduleTime] = useState("");

  const rescheduleToday = new Date();

  const rescheduleDateParts = rescheduleDate.split("-");

  const rescheduleSelectedYear =
    Number(rescheduleDateParts[0]) || rescheduleCurrentYear;

  const rescheduleSelectedMonth =
    Number(rescheduleDateParts[1]) || rescheduleToday.getMonth() + 1;

  const availableRescheduleMonths =
    rescheduleSelectedYear === rescheduleToday.getFullYear()
      ? rescheduleMonthOptions.filter(
          (month) => Number(month.value) >= rescheduleToday.getMonth() + 1,
        )
      : rescheduleMonthOptions;

  const daysInRescheduleMonth = new Date(
    rescheduleSelectedYear,
    rescheduleSelectedMonth,
    0,
  ).getDate();

  const availableRescheduleDays = Array.from(
    { length: daysInRescheduleMonth },
    (_, index) => index + 1,
  )
    .filter((day) => {
      const candidateDate = new Date(
        rescheduleSelectedYear,
        rescheduleSelectedMonth - 1,
        day,
      );

      const todayDate = new Date(
        rescheduleToday.getFullYear(),
        rescheduleToday.getMonth(),
        rescheduleToday.getDate(),
      );

      return candidateDate >= todayDate;
    })
    .map((day) => {
      const value = String(day).padStart(2, "0");

      return {
        value,
        label: value,
      };
    });

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

        try {
          setAppointmentsLoading(true);

          const appointmentResponse = await getMyAppointments();

          if (!active) {
            return;
          }

          setAppointments(appointmentResponse ?? []);
        } catch (appointmentError) {
          if (!active) {
            return;
          }

          setError(
            appointmentError instanceof Error
              ? appointmentError.message
              : "We could not load your appointments.",
          );
        } finally {
          if (active) {
            setAppointmentsLoading(false);
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

  async function handleCancelAppointment(appointmentId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setCancellingAppointmentId(appointmentId);

      const cancelledAppointment = await cancelMyAppointment(appointmentId);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointment_id === appointmentId
            ? cancelledAppointment
            : appointment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not cancel this appointment. Please try again.",
      );
    } finally {
      setCancellingAppointmentId(null);
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

  async function handleRescheduleAppointment() {
    if (!reschedulingAppointmentId) {
      return;
    }

    const completeDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!completeDatePattern.test(rescheduleDate) || !rescheduleTime) {
      setError("Please choose a complete new date and time.");
      return;
    }

    const [hourPart, minutePart] = rescheduleTime.split(":");

    const hour = Number(hourPart);
    const minute = Number(minutePart);

    let hour24: number;

    if (hour >= 8 && hour <= 11) {
      hour24 = hour;
    } else if (hour === 12) {
      hour24 = 12;
    } else if (hour >= 1 && hour <= 6) {
      hour24 = hour + 12;
    } else {
      setError("Please choose a valid appointment time.");
      return;
    }

    if (hour === 6 && minute !== 0) {
      setError("The latest appointment time is 6:00 PM.");
      return;
    }

    const value24 = `${String(hour24).padStart(
      2,
      "0",
    )}:${String(minute).padStart(2, "0")}`;

    const scheduledDate = new Date(`${rescheduleDate}T${value24}:00+01:00`);

    if (
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= Date.now()
    ) {
      setError("Please choose a future appointment date and time.");
      return;
    }

    try {
      setError("");

      const updatedAppointment = await rescheduleMyAppointment(
        reschedulingAppointmentId,
        {
          scheduled_at: scheduledDate.toISOString(),
        },
      );

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointment_id === updatedAppointment.appointment_id
            ? updatedAppointment
            : appointment,
        ),
      );

      setReschedulingAppointmentId(null);
      setRescheduleDate("");
      setRescheduleTime("");
    } catch {
      setError("We could not reschedule your appointment. Please try again.");
    }
  }

  async function handleHideCancelledAppointment(appointmentId: number) {
    const confirmed = window.confirm(
      "Remove this cancelled appointment from your dashboard?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await hideMyCancelledAppointment(appointmentId);

      setAppointments((current) =>
        current.filter(
          (appointment) => appointment.appointment_id !== appointmentId,
        ),
      );
    } catch {
      setError(
        "We could not remove this appointment from your dashboard. Please try again.",
      );
    }
  }

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

              {appointmentsLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse border border-gray-200 p-5"
                    >
                      <div className="h-5 w-36 bg-gray-200" />
                      <div className="mt-3 h-4 w-24 bg-gray-100" />
                      <div className="mt-6 h-4 w-48 bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="px-6 py-10">
                  <p className="text-sm leading-6 text-[#6B7280]">
                    You do not have any service appointments yet.
                  </p>

                  <Link
                    href="/book-appointment"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08294B] transition hover:text-[#D19A24]"
                  >
                    Book service
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {appointments.map((appointment) => (
                    <div key={appointment.appointment_id}>
                      <AppointmentCard
                        appointment={appointment}
                        cancelling={
                          cancellingAppointmentId === appointment.appointment_id
                        }
                        onCancel={handleCancelAppointment}
                        onHideCancelled={() =>
                          handleHideCancelledAppointment(
                            appointment.appointment_id,
                          )
                        }
                        onChooseNewTime={() => {
                          setReschedulingAppointmentId(
                            appointment.appointment_id,
                          );
                          setRescheduleDate("");
                          setRescheduleTime("");
                        }}
                      />

                      {reschedulingAppointmentId ===
                        appointment.appointment_id && (
                        <div className="border border-t-0 border-prussian/10 bg-white p-5 sm:p-6">
                          <h3 className="font-heading text-lg font-bold text-prussian">
                            Choose a New Date & Time
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate">
                            Select another appointment time for UMW to review.
                          </p>

                          <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            {/* DATE */}
                            <div>
                              <p className="mb-2 text-sm font-semibold text-prussian">
                                New Date *
                              </p>

                              <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-2">
                                <CustomerSelect
                                  value={rescheduleDate.split("-")[1] ?? ""}
                                  options={availableRescheduleMonths}
                                  onChange={(month) => {
                                    const parts = rescheduleDate.split("-");
                                    const year =
                                      parts[0] ||
                                      rescheduleCurrentYear.toString();

                                    setRescheduleDate(`${year}-${month}-`);
                                  }}
                                  placeholder="Month"
                                  ariaLabel="Select new appointment month"
                                />

                                <CustomerSelect
                                  value={rescheduleDate.split("-")[2] ?? ""}
                                  options={availableRescheduleDays}
                                  onChange={(day) => {
                                    const parts = rescheduleDate.split("-");

                                    const year =
                                      parts[0] ||
                                      rescheduleCurrentYear.toString();

                                    const month =
                                      parts[1] ||
                                      String(
                                        new Date().getMonth() + 1,
                                      ).padStart(2, "0");

                                    setRescheduleDate(
                                      `${year}-${month}-${day}`,
                                    );
                                  }}
                                  placeholder="Day"
                                  ariaLabel="Select new appointment day"
                                />

                                <CustomerSelect
                                  value={rescheduleDate.split("-")[0] ?? ""}
                                  options={rescheduleYearOptions}
                                  onChange={(year) => {
                                    const parts = rescheduleDate.split("-");

                                    const month =
                                      parts[1] ||
                                      String(
                                        new Date().getMonth() + 1,
                                      ).padStart(2, "0");

                                    setRescheduleDate(`${year}-${month}-`);
                                  }}
                                  placeholder="Year"
                                  ariaLabel="Select new appointment year"
                                />
                              </div>
                            </div>

                            {/* TIME */}
                            <div>
                              <p className="mb-2 text-sm font-semibold text-prussian">
                                New Time *
                              </p>

                              <div className="flex items-center gap-2">
                                <div className="min-w-0 flex-1">
                                  <CustomerSelect
                                    value={rescheduleTime.split(":")[0] ?? ""}
                                    options={rescheduleHourOptions}
                                    onChange={(hour) => {
                                      const currentMinute =
                                        rescheduleTime.split(":")[1] || "";

                                      const minute =
                                        hour === "06" ? "00" : currentMinute;

                                      setRescheduleTime(`${hour}:${minute}`);
                                    }}
                                    placeholder="Hour"
                                    ariaLabel="Select new appointment hour"
                                  />
                                </div>

                                <span className="text-xl font-bold text-prussian">
                                  :
                                </span>

                                <div className="min-w-0 flex-1">
                                  <CustomerSelect
                                    value={rescheduleTime.split(":")[1] ?? ""}
                                    options={
                                      rescheduleTime.split(":")[0] === "06"
                                        ? [{ value: "00", label: "00" }]
                                        : rescheduleMinuteOptions
                                    }
                                    onChange={(minute) => {
                                      const hour =
                                        rescheduleTime.split(":")[0] || "";

                                      setRescheduleTime(`${hour}:${minute}`);
                                    }}
                                    placeholder="Min"
                                    ariaLabel="Select new appointment minute"
                                  />
                                </div>

                                {rescheduleTime.split(":")[0] && (
                                  <div className="flex min-h-12 min-w-14 items-center justify-center border border-bronze/40 bg-[#F7F8FA] px-3 text-sm font-bold text-bronze">
                                    {Number(rescheduleTime.split(":")[0]) >=
                                      8 &&
                                    Number(rescheduleTime.split(":")[0]) <= 11
                                      ? "AM"
                                      : "PM"}
                                  </div>
                                )}
                              </div>

                              <p className="mt-2 text-xs text-slate/70">
                                Opening hours: 8:00 AM – 6:00 PM
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                void handleRescheduleAppointment();
                              }}
                              className="min-h-11 bg-bronze px-5 text-sm font-bold text-prussian transition hover:bg-[#d9a83c]"
                            >
                              Submit New Time
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingAppointmentId(null);
                                setRescheduleDate("");
                                setRescheduleTime("");
                              }}
                              className="min-h-11 border border-prussian/20 px-5 text-sm font-bold text-prussian transition hover:border-prussian"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

function AppointmentCard({
  appointment,
  cancelling,
  onCancel,
  onHideCancelled,
  onChooseNewTime,
}: {
  appointment: Appointment;
  cancelling: boolean;
  onCancel: (appointmentId: number) => void;
  onHideCancelled: () => void;
  onChooseNewTime: () => void;
}) {
  const appointmentDate = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(appointment.scheduled_at));

  const appointmentTime = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(appointment.scheduled_at));

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    reschedule_requested: "Reschedule Requested",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <article className="border border-gray-200 bg-white p-5 transition duration-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">
            Appointment #{appointment.appointment_id}
          </p>

          <h3 className="mt-2 font-heading text-xl font-bold text-[#08294B]">
            {appointment.service_name}
          </h3>

          <p className="mt-1 text-sm text-[#6B7280]">
            {appointment.branch_name}
          </p>
        </div>

        <span className="w-fit border border-[#D19A24]/30 bg-[#D19A24]/10 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8A6416]">
          {statusLabels[appointment.status]}
        </span>
      </div>

      <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            Date
          </p>

          <p className="mt-1 text-sm font-semibold text-[#08294B]">
            {appointmentDate}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            Time
          </p>

          <p className="mt-1 text-sm font-semibold text-[#08294B]">
            {appointmentTime}
          </p>
        </div>
      </div>

      {(appointment.vehicle_make ||
        appointment.vehicle_model ||
        appointment.vehicle_year) && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            Vehicle
          </p>

          <p className="mt-1 text-sm font-semibold text-[#08294B]">
            {[
              appointment.vehicle_make,
              appointment.vehicle_model,
              appointment.vehicle_year,
            ]
              .filter(Boolean)
              .join(" ")}
          </p>

          {appointment.vehicle_plate_number && (
            <p className="mt-1 text-xs text-[#6B7280]">
              Plate: {appointment.vehicle_plate_number}
            </p>
          )}
        </div>
      )}

      {appointment.status === "pending" && (
        <div className="mt-5 border-l-2 border-[#D19A24] pl-3">
          <p className="text-sm font-semibold text-[#08294B]">
            Waiting for UMW review
          </p>

          <p className="mt-1 text-xs leading-5 text-[#6B7280]">
            Your appointment request has been received. UMW will confirm it or
            request another time.
          </p>
        </div>
      )}

      {appointment.status === "reschedule_requested" && (
        <div className="mt-5 border-l-2 border-[#D19A24] bg-[#D19A24]/5 px-4 py-3">
          <p className="text-sm font-semibold text-[#08294B]">
            UMW has requested a new appointment time
          </p>

          {appointment.admin_notes && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
                Message from UMW
              </p>

              <p className="mt-1 text-sm leading-6 text-[#08294B]">
                {appointment.admin_notes}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs leading-5 text-[#6B7280]">
            Please choose another date and time for your appointment.
          </p>

          <button
            type="button"
            onClick={onChooseNewTime}
            className="mt-4 inline-flex h-10 items-center justify-center bg-[#08294B] px-5 text-sm font-bold text-white transition hover:bg-[#061f39]"
          >
            Choose New Date & Time
          </button>
        </div>
      )}

      {(appointment.status === "pending" ||
        appointment.status === "confirmed") && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(appointment.appointment_id)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B1D1D] transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle size={16} />

            {cancelling ? "Cancelling..." : "Cancel appointment"}
          </button>
        </div>
      )}
      {appointment.status === "cancelled" && (
        <button
          type="button"
          onClick={onHideCancelled}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate transition hover:text-[#6B1D1D]"
        >
          <Trash2 size={16} />
          Remove from dashboard
        </button>
      )}
    </article>
  );
}
