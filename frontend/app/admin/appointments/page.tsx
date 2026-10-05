"use client";

import { CalendarDays, CarFront, Clock3, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import AdminModulePage from "@/components/admin/AdminModulePage";

import {
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "@/lib/api/admin-appointments";

import type { Appointment, AppointmentStatus } from "@/types/appointment";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );

  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<
    number | null
  >(null);

  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<
    number | null
  >(null);

  const [rescheduleMessage, setRescheduleMessage] = useState("");
  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminAppointments();

        if (!active) {
          return;
        }

        setAppointments(response ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "We could not load the appointments.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      active = false;
    };
  }, []);
  async function handleConfirmAppointment(appointmentId: number) {
    try {
      setError(null);
      setUpdatingAppointmentId(appointmentId);

      const updatedAppointment = await updateAdminAppointmentStatus(
        appointmentId,
        {
          status: "confirmed",
        },
      );

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointment_id === appointmentId
            ? updatedAppointment
            : appointment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not confirm this appointment.",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  async function handleCompleteAppointment(appointmentId: number) {
    const confirmed = window.confirm("Mark this appointment as completed?");

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setUpdatingAppointmentId(appointmentId);

      const updatedAppointment = await updateAdminAppointmentStatus(
        appointmentId,
        {
          status: "completed",
        },
      );

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointment_id === appointmentId
            ? updatedAppointment
            : appointment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not mark this appointment as completed.",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  async function handleRequestReschedule() {
    if (rescheduleAppointmentId === null) {
      return;
    }

    const message = rescheduleMessage.trim();

    if (!message) {
      setError(
        "Please enter a message explaining why the appointment needs to be rescheduled.",
      );
      return;
    }

    try {
      setError(null);
      setUpdatingAppointmentId(rescheduleAppointmentId);

      const updatedAppointment = await updateAdminAppointmentStatus(
        rescheduleAppointmentId,
        {
          status: "reschedule_requested",
          admin_notes: message,
        },
      );

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointment_id === rescheduleAppointmentId
            ? updatedAppointment
            : appointment,
        ),
      );

      setRescheduleAppointmentId(null);
      setRescheduleMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not request a reschedule.",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.status === statusFilter,
        );

  const appointmentsByBranch = filteredAppointments.reduce<
    Record<string, Appointment[]>
  >((groups, appointment) => {
    const branch = appointment.branch_name;

    if (!groups[branch]) {
      groups[branch] = [];
    }

    groups[branch].push(appointment);

    return groups;
  }, {});

  return (
    <AdminModulePage
      eyebrow="Workshop Operations"
      title="Appointments"
      description="Review, confirm and manage customer service appointments across UMW branches."
      icon={CalendarDays}
    >
      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["pending", "Pending"],
            ["confirmed", "Confirmed"],
            ["reschedule_requested", "Reschedule Requested"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`border px-4 py-2 text-sm font-bold transition ${
              statusFilter === value
                ? "border-[#08294B] bg-[#08294B] text-white"
                : "border-gray-200 bg-white text-[#08294B] hover:border-[#D19A24]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse border border-prussian/10 bg-white p-6"
            >
              <div className="h-5 w-40 bg-gray-200" />
              <div className="mt-4 h-4 w-28 bg-gray-100" />
              <div className="mt-8 h-16 bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="border border-prussian/10 bg-white px-6 py-16 text-center">
          <CalendarDays size={30} className="mx-auto text-[#D19A24]" />

          <p className="mt-5 font-heading text-2xl font-bold text-prussian">
            {statusFilter === "all"
              ? "No customer appointments yet."
              : `No ${statusFilter.replaceAll("_", " ")} appointments.`}
          </p>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6B7280]">
            {statusFilter === "all"
              ? "New customer service appointments will appear here for review."
              : "There are currently no appointments with this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(appointmentsByBranch).map(
            ([branchName, branchAppointments]) => (
              <section key={branchName}>
                <div className="mb-5 border-b border-[#D19A24]/40 pb-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-[#D19A24]" />

                    <h2 className="font-heading text-2xl font-bold text-[#08294B]">
                      {branchName}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-[#6B7280]">
                    {branchAppointments.length}{" "}
                    {branchAppointments.length === 1
                      ? "appointment"
                      : "appointments"}
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {branchAppointments.map((appointment) => (
                    <AdminAppointmentCard
                      key={appointment.appointment_id}
                      appointment={appointment}
                      updating={
                        updatingAppointmentId === appointment.appointment_id
                      }
                      onConfirm={handleConfirmAppointment}
                      onComplete={handleCompleteAppointment}
                      onRequestReschedule={() => {
                        setRescheduleAppointmentId(appointment.appointment_id);
                        setRescheduleMessage("");
                      }}
                    />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
      {rescheduleAppointmentId !== null && (
        <div className="mt-6 border border-[#D19A24]/40 bg-white p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#08294B]">
                Request a New Appointment Time
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Explain to the customer why another date or time is needed. The
                customer will see this message in their account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRescheduleAppointmentId(null);
                setRescheduleMessage("");
              }}
              className="text-[#6B7280] transition hover:text-[#08294B]"
              aria-label="Close reschedule request"
            >
              ×
            </button>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-bold text-[#08294B]">
              Message to customer
            </span>

            <textarea
              value={rescheduleMessage}
              onChange={(event) => setRescheduleMessage(event.target.value)}
              rows={4}
              placeholder="Example: The workshop is fully booked at this time. Please choose another available date or time."
              className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-sm text-[#08294B] outline-none transition placeholder:text-gray-400 focus:border-[#D19A24]"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={updatingAppointmentId === rescheduleAppointmentId}
              onClick={handleRequestReschedule}
              className="inline-flex h-10 items-center justify-center bg-[#08294B] px-5 text-sm font-bold text-white transition hover:bg-[#061f39] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingAppointmentId === rescheduleAppointmentId
                ? "Sending..."
                : "Send Reschedule Request"}
            </button>

            <button
              type="button"
              disabled={updatingAppointmentId === rescheduleAppointmentId}
              onClick={() => {
                setRescheduleAppointmentId(null);
                setRescheduleMessage("");
              }}
              className="inline-flex h-10 items-center justify-center border border-gray-300 bg-white px-5 text-sm font-bold text-[#08294B] transition hover:border-[#08294B]"
            >
              Keep Appointment
            </button>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}

function AdminAppointmentCard({
  appointment,
  updating,
  onConfirm,
  onComplete,
  onRequestReschedule,
}: {
  appointment: Appointment;
  updating: boolean;
  onConfirm: (appointmentId: number) => void;
  onComplete: (appointmentId: number) => void;
  onRequestReschedule: () => void;
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

  return (
    <article className="border border-prussian/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#08294B]">
            {appointment.customer_first_name} {appointment.customer_last_name}
          </h2>

          <p className="mt-2 text-sm font-semibold text-[#6B7280]">
            {appointment.service_name}
          </p>
        </div>

        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-3 text-sm">
          <CalendarDays size={17} className="shrink-0 text-[#D19A24]" />

          <span className="font-semibold text-[#08294B]">
            {appointmentDate}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Clock3 size={17} className="shrink-0 text-[#D19A24]" />

          <span className="font-semibold text-[#08294B]">
            {appointmentTime}
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <MapPin size={17} className="mt-0.5 shrink-0 text-[#D19A24]" />

          <span className="font-semibold text-[#08294B]">
            {appointment.branch_name}
          </span>
        </div>
      </div>

      {(appointment.vehicle_make ||
        appointment.vehicle_model ||
        appointment.vehicle_year) && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="flex items-start gap-3">
            <CarFront size={17} className="mt-0.5 shrink-0 text-[#D19A24]" />

            <div>
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
          </div>
        </div>
      )}

      {appointment.customer_notes && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
            Customer Note
          </p>

          <p className="mt-2 text-sm leading-6 text-[#08294B]">
            {appointment.customer_notes}
          </p>
        </div>
      )}

      {appointment.status === "cancelled" && (
        <div className="mt-5 border-l-2 border-[#6B1D1D] pl-3">
          <p className="text-sm font-semibold text-[#6B1D1D]">
            This appointment has been cancelled.
          </p>
        </div>
      )}

      {appointment.status === "pending" && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
          {" "}
          <button
            type="button"
            disabled={updating}
            onClick={() => onConfirm(appointment.appointment_id)}
            className="inline-flex h-10 items-center justify-center bg-[#08294B] px-5 text-sm font-bold text-white transition hover:bg-[#061f39] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating ? "Confirming..." : "Confirm Appointment"}
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={onRequestReschedule}
            className="inline-flex h-10 items-center justify-center border border-[#D19A24] bg-white px-5 text-sm font-bold text-[#08294B] transition hover:bg-[#D19A24]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request Reschedule
          </button>
        </div>
      )}
      {appointment.status === "confirmed" && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <button
            type="button"
            disabled={updating}
            onClick={() => onComplete(appointment.appointment_id)}
            className="inline-flex h-10 items-center justify-center bg-[#08294B] px-5 text-sm font-bold text-white transition hover:bg-[#061f39] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark as Completed"}
          </button>
        </div>
      )}
    </article>
  );
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const labels: Record<AppointmentStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    reschedule_requested: "Reschedule Requested",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  if (status === "confirmed") {
    return (
      <span className="w-fit border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-green-700">
        {labels[status]}
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="w-fit border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#6B1D1D]">
        {labels[status]}
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="w-fit border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#6B7280]">
        {labels[status]}
      </span>
    );
  }

  return (
    <span className="w-fit border border-[#D19A24]/30 bg-[#D19A24]/10 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#8A6416]">
      {labels[status]}
    </span>
  );
}
