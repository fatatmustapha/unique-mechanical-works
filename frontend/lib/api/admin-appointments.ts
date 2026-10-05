import { apiRequest } from "@/lib/api/client";

import type {
  Appointment,
  AppointmentStatus,
} from "@/types/appointment";

export type AdminAppointmentFilters = {
  status?: AppointmentStatus;
  branch_id?: number;
  service_id?: number;
};

export type UpdateAdminAppointmentStatusInput = {
  status: AppointmentStatus;
  admin_notes?: string | null;
};

export type AdminAppointmentsResponse = {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
  message?: string;
};

export type AdminAppointmentResponse = {
  success: boolean;
  data: {
    appointment: Appointment;
  };
  message?: string;
};

export async function getAdminAppointments(
  filters: AdminAppointmentFilters = {},
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.branch_id) {
    params.set(
      "branch_id",
      filters.branch_id.toString(),
    );
  }

  if (filters.service_id) {
    params.set(
      "service_id",
      filters.service_id.toString(),
    );
  }

  const query = params.toString();

  const response =
    await apiRequest<AdminAppointmentsResponse>(
      `/admin/appointments${query ? `?${query}` : ""}`,
      {
        method: "GET",
      },
    );

  return response.data.appointments;
}

export async function getAdminAppointment(
  appointmentId: number,
) {
  const response =
    await apiRequest<AdminAppointmentResponse>(
      `/admin/appointments/${appointmentId}`,
      {
        method: "GET",
      },
    );

  return response.data.appointment;
}

export async function updateAdminAppointmentStatus(
  appointmentId: number,
  input: UpdateAdminAppointmentStatusInput,
) {
  const response =
    await apiRequest<AdminAppointmentResponse>(
      `/admin/appointments/${appointmentId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data.appointment;
}