"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  Wrench,
} from "lucide-react";

import Link from "next/link";

import { getCurrentUser } from "@/lib/api/auth";
import type { Customer } from "@/types/auth";

import CustomerSelect from "@/components/customer/CustomerSelect";

import {
  createAppointment,
  getServiceBranches,
  getServices,
} from "@/lib/api/appointments";

import type { Branch, BranchService, Service } from "@/types/appointment";

type BranchesResponse = {
  success: boolean;
  data: Branch[];
  message?: string;
};

type FormState = {
  serviceId: string;
  branchId: string;
  date: string;
  time: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlateNumber: string;
  notes: string;
};

const initialForm: FormState = {
  serviceId: "",
  branchId: "",
  date: "",
  time: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehiclePlateNumber: "",
  notes: "",
};
const allMonthOptions = [
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

const currentYear = new Date().getFullYear();

const yearOptions = [
  {
    value: currentYear.toString(),
    label: currentYear.toString(),
  },
  {
    value: (currentYear + 1).toString(),
    label: (currentYear + 1).toString(),
  },
];

const hourOptions = [
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

const minuteOptions = [
  { value: "00", label: "00" },
  { value: "15", label: "15" },
  { value: "30", label: "30" },
  { value: "45", label: "45" },
];

function convertBookingTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  // UMW opens at 8:00 AM.
  if (hour >= 8 && hour <= 11) {
    return {
      value24: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )}`,
      period: "AM" as const,
    };
  }

  // 12:00–12:59 is PM.
  if (hour === 12) {
    return {
      value24: `12:${String(minute).padStart(2, "0")}`,
      period: "PM" as const,
    };
  }

  // 1:00–5:59 is PM.
  if (hour >= 1 && hour <= 5) {
    return {
      value24: `${String(hour + 12).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0",
      )}`,
      period: "PM" as const,
    };
  }

  // 6:00 PM is the final allowed time.
  if (hour === 6 && minute === 0) {
    return {
      value24: "18:00",
      period: "PM" as const,
    };
  }

  return null;
}

const inputClassName =
  "min-h-12 w-full border border-prussian/15 bg-white px-4 text-sm font-medium text-prussian outline-none transition-all duration-200 placeholder:text-slate/60 hover:border-bronze/70 focus:border-bronze";

async function getBranches(): Promise<Branch[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/branches`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load branches.");
  }

  const result = (await response.json()) as BranchesResponse;

  return result.data;
}

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [selectedServiceBranches, setSelectedServiceBranches] = useState<
    BranchService[]
  >([]);

  const [form, setForm] = useState<FormState>(initialForm);

  const [loading, setLoading] = useState(true);

  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBookingOptions() {
      try {
        setLoading(true);
        setError("");

        const [servicesData, branchesData] = await Promise.all([
          getServices(),
          getBranches(),
        ]);

        if (!active) {
          return;
        }

        setServices(servicesData);
        setBranches(branchesData);
      } catch {
        if (active) {
          setError("We could not load the booking options. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookingOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function checkCustomer() {
      try {
        const response = await getCurrentUser();

        if (!active) {
          return;
        }

        if (response.data.accountType === "customer") {
          setCustomer(response.data.customer);
        } else {
          setCustomer(null);
        }
      } catch {
        if (active) {
          setCustomer(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    }

    void checkCustomer();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!form.serviceId) {
      setSelectedServiceBranches([]);
      return;
    }

    let active = true;

    async function checkServiceBranches() {
      try {
        setCheckingAvailability(true);

        const data = await getServiceBranches(Number(form.serviceId));

        if (!active) {
          return;
        }

        setSelectedServiceBranches(data);
      } catch {
        if (active) {
          setSelectedServiceBranches([]);
        }
      } finally {
        if (active) {
          setCheckingAvailability(false);
        }
      }
    }

    void checkServiceBranches();

    return () => {
      active = false;
    };
  }, [form.serviceId]);

  const serviceOptions = useMemo(
    () =>
      services.map((service) => ({
        value: service.service_id.toString(),
        label: service.name,
      })),
    [services],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        value: branch.branch_id.toString(),
        label: `${branch.name} — ${branch.city}`,
      })),
    [branches],
  );

  const selectedService = useMemo(
    () =>
      services.find(
        (service) => service.service_id === Number(form.serviceId),
      ) ?? null,
    [services, form.serviceId],
  );

  const selectedBranch = useMemo(
    () =>
      branches.find((branch) => branch.branch_id === Number(form.branchId)) ??
      null,
    [branches, form.branchId],
  );

  const selectedBranchService = useMemo(
    () =>
      selectedServiceBranches.find(
        (item) => item.branch_id === Number(form.branchId),
      ) ?? null,
    [selectedServiceBranches, form.branchId],
  );

  const combinationUnavailable = Boolean(
    form.serviceId &&
    form.branchId &&
    !checkingAvailability &&
    (!selectedBranchService || !selectedBranchService.is_available),
  );

  const today = new Date();

  const selectedFormYear = Number(form.date.split("-")[0]) || currentYear;

  const monthOptions =
    selectedFormYear === today.getFullYear()
      ? allMonthOptions.filter(
          (month) => Number(month.value) >= today.getMonth() + 1,
        )
      : allMonthOptions;

  const selectedDateParts = form.date.split("-");

  const selectedYear = Number(selectedDateParts[0]) || currentYear;

  const selectedMonth =
    Number(selectedDateParts[1]) || new Date().getMonth() + 1;

  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth,
    0,
  ).getDate();

  const dayOptions = Array.from(
    { length: daysInSelectedMonth },
    (_, index) => index + 1,
  )
    .filter((day) => {
      const candidateDate = new Date(selectedYear, selectedMonth - 1, day);

      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      return candidateDate >= todayDate;
    })
    .map((dayNumber) => {
      const day = String(dayNumber).padStart(2, "0");

      return {
        value: day,
        label: day,
      };
    });
  function updateField(field: keyof FormState, value: string) {
    setSuccess(false);
    setError("");

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const completeDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      !form.serviceId ||
      !form.branchId ||
      !completeDatePattern.test(form.date) ||
      !form.time
    ) {
      setError("Please select a service, branch, complete date and time.");
      return;
    }

    if (checkingAvailability) {
      setError("Please wait while we check service availability.");
      return;
    }

    if (!selectedBranchService || !selectedBranchService.is_available) {
      setError(
        "The selected service is not currently available at this branch. Please choose another service or branch.",
      );
      return;
    }

    const convertedTime = convertBookingTime(form.time);

    if (!convertedTime) {
      setError(
        "Please enter a valid time between 8:00 AM and 6:00 PM, for example 8:30 or 1:30.",
      );
      return;
    }

    const scheduledDate = new Date(
      `${form.date}T${convertedTime.value24}:00+01:00`,
    );

    if (
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= Date.now()
    ) {
      setError("Please choose a future appointment date and time.");
      return;
    }

    try {
      setSubmitting(true);

      await createAppointment({
        service_id: Number(form.serviceId),
        branch_id: Number(form.branchId),
        scheduled_at: scheduledDate.toISOString(),

        vehicle_make: form.vehicleMake.trim() || null,

        vehicle_model: form.vehicleModel.trim() || null,

        vehicle_year: form.vehicleYear ? Number(form.vehicleYear) : null,

        vehicle_plate_number: form.vehiclePlateNumber.trim() || null,

        customer_notes: form.notes.trim() || null,
      });

      setForm(initialForm);
      setSelectedServiceBranches([]);
      setSuccess(true);
    } catch {
      setError(
        "We could not book your appointment. Please make sure you are signed in and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[#F7F8FA] px-5 pb-20 pt-36 sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-bronze">
            Vehicle Care
          </p>

          <h1 className="mt-4 font-heading text-4xl font-bold tracking-[-0.035em] text-prussian sm:text-5xl">
            Book a Service Appointment
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate">
            Select your preferred branch, service and visit time. Our team will
            review your request before confirming the appointment.
          </p>
        </div>

        {!authLoading && !customer && (
          <div className="border border-prussian/10 bg-white p-7 shadow-sm sm:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-bronze">
              Customer Account
            </p>

            <h2 className="mt-3 font-heading text-2xl font-bold text-prussian">
              Sign in to book your appointment
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
              Appointments are linked to your UMW account so you can track
              confirmations, rescheduling requests and appointment status from
              My Account.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center bg-bronze px-7 text-sm font-bold text-prussian transition hover:bg-[#d9a83c]"
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center border border-prussian px-7 text-sm font-bold text-prussian transition hover:bg-prussian hover:text-white"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {!authLoading && customer && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            {" "}
            <form
              onSubmit={handleSubmit}
              className="border border-prussian/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
            >
              <div className="mb-8 flex items-center gap-4 border-b border-prussian/10 pb-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-prussian text-white">
                  <Wrench size={19} />
                </div>

                <div>
                  <h2 className="font-heading text-xl font-semibold text-prussian">
                    Appointment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate">
                    Tell us when and where you would like to visit.
                  </p>
                </div>
              </div>

              <div className="mb-8 border-l-4 border-bronze bg-[#F7F8FA] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate">
                  Booking as
                </p>

                <p className="mt-2 font-heading text-lg font-bold text-prussian">
                  {customer.first_name} {customer.last_name}
                </p>

                <p className="mt-1 text-sm text-slate">{customer.phone}</p>

                <p className="mt-2 text-xs leading-5 text-slate/70">
                  This appointment will be linked to your UMW account.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-7 lg:grid-cols-2">
                {" "}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-prussian">
                    Branch *
                  </label>

                  <CustomerSelect
                    value={form.branchId}
                    options={branchOptions}
                    onChange={(value) => updateField("branchId", value)}
                    placeholder={
                      loading ? "Loading branches..." : "Select a branch"
                    }
                    ariaLabel="Select branch"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-prussian">
                    Service *
                  </label>

                  <CustomerSelect
                    value={form.serviceId}
                    options={serviceOptions}
                    onChange={(value) => updateField("serviceId", value)}
                    placeholder={
                      loading ? "Loading services..." : "Select a service"
                    }
                    ariaLabel="Select service"
                  />
                </div>
                <div>
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-prussian">
                    <CalendarDays size={16} />
                    Preferred Date *
                  </span>

                  <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-2">
                    <CustomerSelect
                      value={form.date.split("-")[1] ?? ""}
                      options={monthOptions}
                      onChange={(month) => {
                        const parts = form.date.split("-");
                        const year = parts[0] || currentYear.toString();
                        const day = parts[2] || "";

                        updateField("date", `${year}-${month}-${day}`);
                      }}
                      placeholder="Month"
                      ariaLabel="Select appointment month"
                    />

                    <CustomerSelect
                      value={form.date.split("-")[2] ?? ""}
                      options={dayOptions}
                      onChange={(day) => {
                        const parts = form.date.split("-");
                        const year = parts[0] || currentYear.toString();

                        const month =
                          parts[1] ||
                          String(new Date().getMonth() + 1).padStart(2, "0");

                        updateField("date", `${year}-${month}-${day}`);
                      }}
                      placeholder="Day"
                      ariaLabel="Select appointment day"
                    />

                    <CustomerSelect
                      value={form.date.split("-")[0] ?? ""}
                      options={yearOptions}
                      onChange={(year) => {
                        const parts = form.date.split("-");

                        const month =
                          parts[1] ||
                          String(new Date().getMonth() + 1).padStart(2, "0");

                        const day = parts[2] || "";

                        updateField("date", `${year}-${month}-${day}`);
                      }}
                      placeholder="Year"
                      ariaLabel="Select appointment year"
                    />
                  </div>
                </div>
                <div>
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-prussian">
                    <Clock3 size={16} />
                    Preferred Time *
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <CustomerSelect
                        value={form.time.split(":")[0] ?? ""}
                        options={hourOptions}
                        onChange={(hour) => {
                          const currentMinute = form.time.split(":")[1] || "";

                          const minute = hour === "06" ? "00" : currentMinute;

                          updateField("time", `${hour}:${minute}`);
                        }}
                        placeholder="Hour"
                        ariaLabel="Select appointment hour"
                      />
                    </div>

                    <span className="text-xl font-bold text-prussian">:</span>

                    <div className="min-w-0 flex-1">
                      <CustomerSelect
                        value={form.time.split(":")[1] ?? ""}
                        options={
                          form.time.split(":")[0] === "06"
                            ? [{ value: "00", label: "00" }]
                            : minuteOptions
                        }
                        onChange={(minute) => {
                          const hour = form.time.split(":")[0] || "";

                          updateField("time", `${hour}:${minute}`);
                        }}
                        placeholder="Min"
                        ariaLabel="Select appointment minute"
                      />
                    </div>

                    {form.time.split(":")[0] && (
                      <div className="flex min-h-12 min-w-14 items-center justify-center border border-bronze/40 bg-[#F7F8FA] px-3 text-sm font-bold text-bronze">
                        {Number(form.time.split(":")[0]) >= 8 &&
                        Number(form.time.split(":")[0]) <= 11
                          ? "AM"
                          : "PM"}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex gap-8 text-[11px] text-slate/60">
                    <span>Hour</span>
                    <span>Minute</span>
                  </div>

                  <p className="mt-2 text-xs text-slate/70">
                    Opening hours: 8:00 AM – 6:00 PM
                  </p>
                </div>
              </div>

              {combinationUnavailable && (
                <div className="mt-6 border-l-4 border-[#6B1D1D] bg-red-50 px-4 py-3 text-sm leading-6 text-[#6B1D1D]">
                  This service is not currently available at the selected
                  branch. You can change either the branch or the service.
                </div>
              )}

              <div className="my-9 border-t border-prussian/10" />

              <div className="mb-6 flex items-center gap-3">
                <Car size={20} className="text-bronze" />

                <h2 className="font-heading text-xl font-semibold text-prussian">
                  Vehicle Information
                </h2>

                <span className="text-sm text-slate/60">Optional</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-prussian">
                    Make
                  </span>

                  <input
                    type="text"
                    value={form.vehicleMake}
                    onChange={(event) =>
                      updateField("vehicleMake", event.target.value)
                    }
                    placeholder="e.g. Toyota"
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-prussian">
                    Model
                  </span>

                  <input
                    type="text"
                    value={form.vehicleModel}
                    onChange={(event) =>
                      updateField("vehicleModel", event.target.value)
                    }
                    placeholder="e.g. Prado"
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-prussian">
                    Year
                  </span>

                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={form.vehicleYear}
                    onChange={(event) =>
                      updateField("vehicleYear", event.target.value)
                    }
                    placeholder="e.g. 2022"
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-prussian">
                    Plate Number
                  </span>

                  <input
                    type="text"
                    value={form.vehiclePlateNumber}
                    onChange={(event) =>
                      updateField("vehiclePlateNumber", event.target.value)
                    }
                    placeholder="Vehicle registration"
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-semibold text-prussian">
                  Additional Notes
                </span>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Tell us anything that may help our team prepare for your visit."
                  className={`${inputClassName} resize-none py-3`}
                />
              </label>

              {error && (
                <div className="mt-6 border-l-4 border-[#6B1D1D] bg-red-50 px-4 py-3 text-sm leading-6 text-[#6B1D1D]">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 flex gap-3 border-l-4 border-green-600 bg-green-50 px-4 py-4 text-sm text-green-800">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Appointment request submitted.
                    </p>

                    <p className="mt-1 leading-6">
                      Your appointment is pending review. UMW will confirm it or
                      request another time if needed.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loading || combinationUnavailable}
                className="mt-8 inline-flex min-h-12 items-center justify-center bg-bronze px-7 text-sm font-bold text-prussian transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d9a83c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? "Submitting..." : "Request Appointment"}
              </button>
            </form>
            <aside className="h-fit bg-prussian p-7 text-white lg:sticky lg:top-32">
              <MapPin size={24} className="text-bronze" />

              <h2 className="mt-5 font-heading text-2xl font-semibold">
                Your Visit
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/65">
                Your preferred appointment time is submitted as a request. Our
                team will review it before confirming your visit.
              </p>

              {(selectedBranch || selectedService) && (
                <div className="mt-7 border-t border-white/15 pt-6">
                  {selectedBranch && (
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze">
                        Branch
                      </p>

                      <p className="mt-2 font-semibold">
                        {selectedBranch.name}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-white/55">
                        {selectedBranch.address}
                      </p>
                    </div>
                  )}

                  {selectedService && (
                    <div className="mt-6">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze">
                        Service
                      </p>

                      <p className="mt-2 font-semibold">
                        {selectedService.name}
                      </p>
                    </div>
                  )}

                  {selectedBranchService?.is_available &&
                    (selectedBranchService.estimated_price_min !== null ||
                      selectedBranchService.estimated_price_max !== null) && (
                      <div className="mt-6">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze">
                          Estimated Price
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {selectedBranchService.estimated_price_min !== null &&
                            `₦${selectedBranchService.estimated_price_min.toLocaleString()}`}

                          {selectedBranchService.estimated_price_min !== null &&
                            selectedBranchService.estimated_price_max !==
                              null &&
                            " – "}

                          {selectedBranchService.estimated_price_max !== null &&
                            `₦${selectedBranchService.estimated_price_max.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                </div>
              )}

              <div className="mt-7 border-t border-white/15 pt-6">
                <p className="text-sm leading-7 text-white/65">
                  If your requested time cannot be accommodated, UMW can request
                  a reschedule. You will be able to choose another time from
                  your account.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
