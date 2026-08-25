import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  createInvoiceForAdmin,
  getInvoiceForAdmin,
  getInvoicesForAdmin,
  getMyInvoice,
  getMyInvoices,
  recordPaymentForAdmin,
  updateInvoiceForAdmin,
} from "../services/invoice.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  adminInvoicesQuerySchema,
  createInvoiceSchema,
  invoiceIdParamSchema,
  recordInvoicePaymentSchema,
  updateInvoiceSchema,
} from "../validators/invoice.validator.js";

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

const getAdminId = (
  request: Request,
): number => {
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

  return request.user.id;
};

/* =========================================================
   CUSTOMER INVOICES
   ========================================================= */

export const getMine = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const invoices =
      await getMyInvoices(
        customerId,
      );

    sendSuccess(
      response,
      200,
      invoices,
      "Invoices retrieved successfully.",
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
      invoiceIdParamSchema.parse(
        request.params,
      );

    const invoice =
      await getMyInvoice(
        customerId,
        id,
      );

    sendSuccess(
      response,
      200,
      { invoice },
      "Invoice retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

/* =========================================================
   ADMIN INVOICES
   ========================================================= */

export const getAdminInvoices = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    getAdminId(request);

    const query =
      adminInvoicesQuerySchema.parse(
        request.query,
      );

    const result =
      await getInvoicesForAdmin(
        query,
      );

    sendSuccess(
      response,
      200,
      result,
      "Admin invoices retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const getAdminInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    getAdminId(request);

    const { id } =
      invoiceIdParamSchema.parse(
        request.params,
      );

    const invoice =
      await getInvoiceForAdmin(
        id,
      );

    sendSuccess(
      response,
      200,
      { invoice },
      "Invoice retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createAdminInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId =
      getAdminId(request);

    const input =
      createInvoiceSchema.parse(
        request.body,
      );

    const invoice =
      await createInvoiceForAdmin(
        adminId,
        input,
      );

    sendSuccess(
      response,
      201,
      { invoice },
      "Invoice created successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const updateAdminInvoice = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    getAdminId(request);

    const { id } =
      invoiceIdParamSchema.parse(
        request.params,
      );

    const input =
      updateInvoiceSchema.parse(
        request.body,
      );

    const invoice =
      await updateInvoiceForAdmin(
        id,
        input,
      );

    sendSuccess(
      response,
      200,
      { invoice },
      "Invoice updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const recordAdminInvoicePayment =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      getAdminId(request);

      const { id } =
        invoiceIdParamSchema.parse(
          request.params,
        );

      const input =
        recordInvoicePaymentSchema.parse(
          request.body,
        );

      const invoice =
        await recordPaymentForAdmin(
          id,
          input,
        );

      sendSuccess(
        response,
        200,
        { invoice },
        "Invoice payment recorded successfully.",
      );
    } catch (error: unknown) {
      next(error);
    }
  };