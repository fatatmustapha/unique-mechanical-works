import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { sendSuccess } from "../utils/api-response.js";

import {
  getPublicCar,
  getPublicCars,
} from "../services/car.service.js";

import { carSlugParamSchema } from "../validators/car.validator.js";

export const getCars = async (
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const cars =
      await getPublicCars();

    sendSuccess(
      response,
      200,
      cars,
      "Cars retrieved successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const getCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { slug } =
      carSlugParamSchema.parse(
        request.params,
      );

    const car =
      await getPublicCar(slug);

    sendSuccess(
      response,
      200,
      { car },
      "Car retrieved successfully.",
    );
  } catch (error) {
    next(error);
  }
};