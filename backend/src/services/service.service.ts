import { AppError } from "../errors/app-error.js";
import {
  createService,
  findActiveServiceById,
  findActiveServices,
  findAnotherServiceByName,
  findAnotherServiceBySlug,
  findServiceById,
  updateService,
  updateServiceStatus,
  type Service,
} from "../repositories/service.repository.js";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  UpdateServiceStatusInput,
} from "../validators/service.validator.js";

export const getPublicServices = async (): Promise<Service[]> => {
  return findActiveServices();
};

export const getPublicServiceById = async (
  serviceId: number,
): Promise<Service> => {
  const service = await findActiveServiceById(serviceId);

  if (!service) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_NOT_FOUND",
      message: "Service not found.",
    });
  }

  return service;
};

export const createServiceForAdmin = async (
  input: CreateServiceInput,
): Promise<Service> => {
  const duplicateName = await findAnotherServiceByName(
    input.name,
  );

  if (duplicateName) {
    throw new AppError({
      statusCode: 409,
      code: "SERVICE_NAME_ALREADY_EXISTS",
      message: "A service with this name already exists.",
    });
  }

  const duplicateSlug = await findAnotherServiceBySlug(
    input.slug,
  );

  if (duplicateSlug) {
    throw new AppError({
      statusCode: 409,
      code: "SERVICE_SLUG_ALREADY_EXISTS",
      message: "A service with this slug already exists.",
    });
  }

  return createService(input);
};

export const updateServiceForAdmin = async (
  serviceId: number,
  input: UpdateServiceInput,
): Promise<Service> => {
  const existingService = await findServiceById(serviceId);

  if (!existingService) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_NOT_FOUND",
      message: "Service not found.",
    });
  }

  if (input.name !== undefined) {
    const duplicateName =
      await findAnotherServiceByName(
        input.name,
        serviceId,
      );

    if (duplicateName) {
      throw new AppError({
        statusCode: 409,
        code: "SERVICE_NAME_ALREADY_EXISTS",
        message: "A service with this name already exists.",
      });
    }
  }

  if (input.slug !== undefined) {
    const duplicateSlug =
      await findAnotherServiceBySlug(
        input.slug,
        serviceId,
      );

    if (duplicateSlug) {
      throw new AppError({
        statusCode: 409,
        code: "SERVICE_SLUG_ALREADY_EXISTS",
        message: "A service with this slug already exists.",
      });
    }
  }

  await updateService(serviceId, input);

  const updatedService = await findServiceById(serviceId);

  if (!updatedService) {
    throw new Error(
      "The updated service could not be retrieved.",
    );
  }

  return updatedService;
};

export const changeServiceStatus = async (
  serviceId: number,
  input: UpdateServiceStatusInput,
): Promise<Service> => {
  const existingService = await findServiceById(serviceId);

  if (!existingService) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_NOT_FOUND",
      message: "Service not found.",
    });
  }

  await updateServiceStatus(
    serviceId,
    input.is_active,
  );

  const updatedService = await findServiceById(serviceId);

  if (!updatedService) {
    throw new Error(
      "The updated service could not be retrieved.",
    );
  }

  return updatedService;
};