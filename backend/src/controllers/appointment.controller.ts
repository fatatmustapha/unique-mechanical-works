import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  cancelMyAppointment,
  changeAppointmentStatusForAdmin,
  createMyAppointment,
  editAppointmentForAdmin,
  getAppointmentForAdmin,
  getAppointmentsForAdmin,
  getMyAppointment,
  getMyAppointments,
} from "../services/appointment.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  adminAppointmentsQuerySchema,
  appointmentIdParamSchema,
  createAppointmentSchema,
  updateAppointmentAdminSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointment.validator.js";

const getCustomerId = (
  request: Request,
): number => {
  if (
    !request.user ||
    request.user.accountType !== "customer"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message:
        "Customer authentication is required.",
    });
  }

  return request.user.id;
};

const getAdminUser = (
  request: Request,
) => {
  if (
    !request.user ||
    request.user.accountType !== "admin"
  ) {
    throw new AppError({
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      message:
        "Administrator authentication is required.",
    });
  }

  return request.user;
};

/* =========================================================
   CUSTOMER APPOINTMENTS
   ========================================================= */

export const bookAppointment = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const input =
      createAppointmentSchema.parse(
        request.body,
      );

    const appointment =
      await createMyAppointment(
        customerId,
        input,
      );

    sendSuccess(
      response,
      201,
      { appointment },
      "Appointment booked successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getMine = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const appointments =
      await getMyAppointments(
        customerId,
      );

    sendSuccess(
      response,
      200,
      appointments,
      "Appointments retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getMineById = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const { id } =
      appointmentIdParamSchema.parse(
        request.params,
      );

    const appointment =
      await getMyAppointment(
        customerId,
        id,
      );

    sendSuccess(
      response,
      200,
      { appointment },
      "Appointment retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const cancelMine = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const { id } =
      appointmentIdParamSchema.parse(
        request.params,
      );

    const appointment =
      await cancelMyAppointment(
        customerId,
        id,
      );

    sendSuccess(
      response,
      200,
      { appointment },
      "Appointment cancelled successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   ADMIN APPOINTMENTS
   ========================================================= */

export const getAdminAppointments = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const query =
      adminAppointmentsQuerySchema.parse(
        request.query,
      );

    const result =
      await getAppointmentsForAdmin(
        query,
        admin,
      );

    sendSuccess(
      response,
      200,
      result,
      "Admin appointments retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getAdminAppointment = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const { id } =
      appointmentIdParamSchema.parse(
        request.params,
      );

    const appointment =
      await getAppointmentForAdmin(
        id,
        admin,
      );

    sendSuccess(
      response,
      200,
      { appointment },
      "Admin appointment retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateAdminAppointment = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const admin =
      getAdminUser(request);

    const { id } =
      appointmentIdParamSchema.parse(
        request.params,
      );

    const input =
      updateAppointmentAdminSchema.parse(
        request.body,
      );

    const appointment =
      await editAppointmentForAdmin(
        id,
        input,
        admin,
      );

    sendSuccess(
      response,
      200,
      { appointment },
      "Appointment updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateAdminAppointmentStatus =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const admin =
        getAdminUser(request);

      const { id } =
        appointmentIdParamSchema.parse(
          request.params,
        );

      const input =
        updateAppointmentStatusSchema.parse(
          request.body,
        );

      const appointment =
        await changeAppointmentStatusForAdmin(
          id,
          input,
          admin,
        );

      sendSuccess(
        response,
        200,
        { appointment },
        "Appointment status updated successfully.",
      );
    } catch (error: unknown) {
      next(error);
    }
  };