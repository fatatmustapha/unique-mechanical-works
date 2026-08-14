import { AppError } from "../errors/app-error.js";
import {
  findActiveServiceById,
  findActiveServices,
  type Service,
} from "../repositories/service.repository.js";

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