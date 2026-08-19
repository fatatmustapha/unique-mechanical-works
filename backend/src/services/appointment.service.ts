import { AppError } from "../errors/app-error.js";
import {
  cancelCustomerAppointment,
  createCustomerAppointment,
  findAdminAppointments,
  findAppointmentByIdForAdmin,
  findCustomerAppointmentById,
  findCustomerAppointments,
  updateAppointmentForAdmin,
  updateAppointmentStatus,
  type Appointment,
} from "../repositories/appointment.repository.js";
import { findBranchService } from "../repositories/branch-service.repository.js";
import type {
  AdminAppointmentsQuery,
  CreateAppointmentInput,
  UpdateAppointmentAdminInput,
  UpdateAppointmentStatusInput,
} from "../validators/appointment.validator.js";

type AppointmentAdminScope = {
  adminRole?: "super_admin" | "branch_admin";
  branchId?: number | null;
};

export interface PaginatedAdminAppointments {
  appointments: Appointment[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const validateBookableBranchService = async (
  branchId: number,
  serviceId: number,
): Promise<void> => {
  const branchService = await findBranchService(
    serviceId,
    branchId,
  );

  if (!branchService) {
    throw new AppError({
      statusCode: 400,
      code: "SERVICE_NOT_OFFERED_AT_BRANCH",
      message:
        "The selected service is not offered at this branch.",
    });
  }

  if (!branchService.is_available) {
    throw new AppError({
      statusCode: 400,
      code: "SERVICE_NOT_AVAILABLE_AT_BRANCH",
      message:
        "The selected service is currently unavailable at this branch.",
    });
  }
};

const ensureAdminCanManageAppointment = (
  appointment: Appointment,
  admin: AppointmentAdminScope,
): void => {
  if (
    admin.adminRole === "branch_admin" &&
    admin.branchId !== appointment.branch_id
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators can manage appointments only for their assigned branch.",
    });
  }
};

/* =========================================================
   CUSTOMER APPOINTMENTS
   ========================================================= */

export const createMyAppointment = async (
  customerId: number,
  input: CreateAppointmentInput,
): Promise<Appointment> => {
  await validateBookableBranchService(
    input.branch_id,
    input.service_id,
  );

  return createCustomerAppointment(
    customerId,
    input,
  );
};

export const getMyAppointments = async (
  customerId: number,
): Promise<Appointment[]> => {
  return findCustomerAppointments(
    customerId,
  );
};

export const getMyAppointment = async (
  customerId: number,
  appointmentId: number,
): Promise<Appointment> => {
  const appointment =
    await findCustomerAppointmentById(
      appointmentId,
      customerId,
    );

  if (!appointment) {
    throw new AppError({
      statusCode: 404,
      code: "APPOINTMENT_NOT_FOUND",
      message: "Appointment not found.",
    });
  }

  return appointment;
};

export const cancelMyAppointment = async (
  customerId: number,
  appointmentId: number,
): Promise<Appointment> => {
  const appointment = await getMyAppointment(
    customerId,
    appointmentId,
  );

  if (appointment.status === "cancelled") {
    throw new AppError({
      statusCode: 409,
      code: "APPOINTMENT_ALREADY_CANCELLED",
      message:
        "This appointment has already been cancelled.",
    });
  }

  if (appointment.status === "completed") {
    throw new AppError({
      statusCode: 409,
      code:
        "COMPLETED_APPOINTMENT_CANNOT_BE_CANCELLED",
      message:
        "A completed appointment cannot be cancelled.",
    });
  }

  const cancelled =
    await cancelCustomerAppointment(
      appointmentId,
      customerId,
    );

  if (!cancelled) {
    throw new AppError({
      statusCode: 409,
      code: "APPOINTMENT_CANNOT_BE_CANCELLED",
      message:
        "This appointment can no longer be cancelled.",
    });
  }

  return getMyAppointment(
    customerId,
    appointmentId,
  );
};

/* =========================================================
   ADMIN APPOINTMENTS
   ========================================================= */

export const getAppointmentsForAdmin = async (
  query: AdminAppointmentsQuery,
  admin: AppointmentAdminScope,
): Promise<PaginatedAdminAppointments> => {
  let branchId = query.branch_id;

  if (admin.adminRole === "branch_admin") {
    if (
      admin.branchId === undefined ||
      admin.branchId === null
    ) {
      throw new AppError({
        statusCode: 403,
        code: "ADMIN_BRANCH_REQUIRED",
        message:
          "This branch administrator is not assigned to a branch.",
      });
    }

    if (
      branchId !== undefined &&
      branchId !== admin.branchId
    ) {
      throw new AppError({
        statusCode: 403,
        code: "BRANCH_SCOPE_VIOLATION",
        message:
          "Branch administrators can view appointments only for their assigned branch.",
      });
    }

    branchId = admin.branchId;
  }

  const result = await findAdminAppointments({
    ...(query.status !== undefined
      ? { status: query.status }
      : {}),

    ...(branchId !== undefined
      ? { branchId }
      : {}),

    ...(query.service_id !== undefined
      ? { serviceId: query.service_id }
      : {}),

    page: query.page,
    limit: query.limit,
  });

  return {
    appointments: result.appointments,

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,

      totalPages:
        result.total === 0
          ? 0
          : Math.ceil(
              result.total / query.limit,
            ),
    },
  };
};

export const getAppointmentForAdmin = async (
  appointmentId: number,
  admin: AppointmentAdminScope,
): Promise<Appointment> => {
  const appointment =
    await findAppointmentByIdForAdmin(
      appointmentId,
    );

  if (!appointment) {
    throw new AppError({
      statusCode: 404,
      code: "APPOINTMENT_NOT_FOUND",
      message: "Appointment not found.",
    });
  }

  ensureAdminCanManageAppointment(
    appointment,
    admin,
  );

  return appointment;
};

export const editAppointmentForAdmin = async (
  appointmentId: number,
  input: UpdateAppointmentAdminInput,
  admin: AppointmentAdminScope,
): Promise<Appointment> => {
  const existing =
    await getAppointmentForAdmin(
      appointmentId,
      admin,
    );

  if (
    existing.status === "completed" ||
    existing.status === "cancelled"
  ) {
    throw new AppError({
      statusCode: 409,
      code: "APPOINTMENT_NOT_EDITABLE",
      message:
        "Completed or cancelled appointments cannot be edited.",
    });
  }

  const resultingBranchId =
    input.branch_id ??
    existing.branch_id;

  const resultingServiceId =
    input.service_id ??
    existing.service_id;

  if (
    admin.adminRole === "branch_admin" &&
    admin.branchId !== resultingBranchId
  ) {
    throw new AppError({
      statusCode: 403,
      code: "BRANCH_SCOPE_VIOLATION",
      message:
        "Branch administrators cannot move appointments to another branch.",
    });
  }

  if (
    input.branch_id !== undefined ||
    input.service_id !== undefined
  ) {
    await validateBookableBranchService(
      resultingBranchId,
      resultingServiceId,
    );
  }

  await updateAppointmentForAdmin(
    appointmentId,
    input,
  );

  return getAppointmentForAdmin(
    appointmentId,
    admin,
  );
};

export const changeAppointmentStatusForAdmin =
  async (
    appointmentId: number,
    input: UpdateAppointmentStatusInput,
    admin: AppointmentAdminScope,
  ): Promise<Appointment> => {
    const appointment =
      await getAppointmentForAdmin(
        appointmentId,
        admin,
      );

    if (
      appointment.status === "completed" &&
      input.status !== "completed"
    ) {
      throw new AppError({
        statusCode: 409,
        code: "COMPLETED_APPOINTMENT_FINAL",
        message:
          "A completed appointment cannot be moved to another status.",
      });
    }

    if (
      appointment.status === "cancelled" &&
      input.status !== "cancelled"
    ) {
      throw new AppError({
        statusCode: 409,
        code: "CANCELLED_APPOINTMENT_FINAL",
        message:
          "A cancelled appointment cannot be moved to another status.",
      });
    }

    await updateAppointmentStatus(
      appointmentId,
      input.status,
      input.admin_notes,
    );

    return getAppointmentForAdmin(
      appointmentId,
      admin,
    );
  };