import { AppError } from "../errors/app-error.js";

import {
  findPublishedCarBySlug,
  findPublishedCars,
} from "../repositories/car.repository.js";

export const getPublicCars = async () => {
  return findPublishedCars();
};

export const getPublicCar = async (
  slug: string,
) => {
  const car =
    await findPublishedCarBySlug(slug);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  return car;
};