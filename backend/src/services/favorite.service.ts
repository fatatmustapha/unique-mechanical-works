import { AppError } from "../errors/app-error.js";
import { findCarById } from "../repositories/car.repository.js";
import {
  createFavorite,
  deleteFavorite,
  findCustomerFavorites,
  findFavorite,
  type Favorite,
} from "../repositories/favorite.repository.js";

export const getMyFavorites = async (
  customerId: number,
): Promise<Favorite[]> => {
  return findCustomerFavorites(
    customerId,
  );
};

export const addMyFavorite = async (
  customerId: number,
  carId: number,
): Promise<void> => {
  const car = await findCarById(
    carId,
  );

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  if (
    car.publication_status !==
      "published" ||
    car.sale_status === "sold"
  ) {
    throw new AppError({
      statusCode: 409,
      code: "CAR_NOT_AVAILABLE_TO_FAVORITE",
      message:
        "Only currently available published cars can be added to favorites.",
    });
  }

  const alreadyFavorite =
    await findFavorite(
      customerId,
      carId,
    );

  if (alreadyFavorite) {
    throw new AppError({
      statusCode: 409,
      code: "CAR_ALREADY_FAVORITED",
      message:
        "This car is already in your favorites.",
    });
  }

  await createFavorite(
    customerId,
    carId,
  );
};

export const removeMyFavorite = async (
  customerId: number,
  carId: number,
): Promise<void> => {
  const deleted =
    await deleteFavorite(
      customerId,
      carId,
    );

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "FAVORITE_NOT_FOUND",
      message:
        "This car is not in your favorites.",
    });
  }
};