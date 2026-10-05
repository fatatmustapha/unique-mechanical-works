import { apiRequest } from "@/lib/api/client";

import type {
  Appointment,
  BranchService,
  CreateAppointmentInput,
  RescheduleAppointmentInput,
  Service,
} from "@/types/appointment";

type ServicesResponse = {
  success: boolean;
  data: Service[];
  message?: string;
};

type ServiceBranchesResponse = {
  success: boolean;
  data: BranchService[];
  message?: string;
};

type AppointmentResponse = {
  success: boolean;
  data: {
    appointment: Appointment;
  };
  message?: string;
};

type MyAppointmentsResponse = {
  success: boolean;
  data: Appointment[];
  message?: string;
};

export const getServices = async (): Promise<Service[]> => {
  const response = await apiRequest<ServicesResponse>("/services");

  return response.data;
};

export const getServiceBranches = async (
  serviceId: number,
): Promise<BranchService[]> => {
  const response = await apiRequest<ServiceBranchesResponse>(
    `/services/${serviceId}/branches`,
  );

  return response.data;
};

export const createAppointment = async (
  input: CreateAppointmentInput,
): Promise<Appointment> => {
  const response = await apiRequest<AppointmentResponse>("/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.appointment;
};

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const response =
    await apiRequest<MyAppointmentsResponse>("/appointments/mine");

  return response.data;
};

export const cancelMyAppointment = async (
  appointmentId: number,
): Promise<Appointment> => {
  const response = await apiRequest<AppointmentResponse>(
    `/appointments/mine/${appointmentId}/cancel`,
    {
      method: "PATCH",
    },
  );

  return response.data.appointment;
};

export async function hideMyCancelledAppointment(
  appointmentId: number,
): Promise<void> {
  await apiRequest(`/appointments/mine/${appointmentId}/hide`, {
    method: "PATCH",
  });
}

export const rescheduleMyAppointment = async (
  appointmentId: number,
  input: RescheduleAppointmentInput,
): Promise<Appointment> => {
  const response = await apiRequest<AppointmentResponse>(
    `/appointments/mine/${appointmentId}/reschedule`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data.appointment;
};
