import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";
import {
  addMyFavorite,
  getMyFavorites,
  removeMyFavorite,
} from "../services/favorite.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { favoriteCarIdParamSchema } from "../validators/favorite.validator.js";

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

export const getFavorites = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const favorites =
      await getMyFavorites(
        customerId,
      );

    sendSuccess(
      response,
      200,
      favorites,
      "Favorites retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const addFavorite = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const { carId } =
      favoriteCarIdParamSchema.parse(
        request.params,
      );

    await addMyFavorite(
      customerId,
      carId,
    );

    sendSuccess(
      response,
      201,
      {},
      "Car added to favorites successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const removeFavorite = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customerId =
      getCustomerId(request);

    const { carId } =
      favoriteCarIdParamSchema.parse(
        request.params,
      );

    await removeMyFavorite(
      customerId,
      carId,
    );

    sendSuccess(
      response,
      200,
      {},
      "Car removed from favorites successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};