import fs from "node:fs/promises";
import path from "node:path";
import { AppError } from "../errors/app-error.js";
import { findCarById } from "../repositories/car.repository.js";
import {
  createCarImage,
  deleteCarImage,
  findCarImageById,
  findCarImages,
  reorderCarImages,
  setPrimaryCarImage,
  updateCarImage,
  type CarImage,
} from "../repositories/car-image.repository.js";
import type {
  CreateCarImageInput,
  ReorderCarImagesInput,
  UpdateCarImageInput,
} from "../validators/car-image.validator.js";

export const getCarImages = async (
  carId: number,
): Promise<CarImage[]> => {
  const car = await findCarById(carId);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  return findCarImages(carId);
};

export const addCarImage = async (
  carId: number,
  input: CreateCarImageInput,
): Promise<CarImage> => {
  const car = await findCarById(carId);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  return createCarImage(carId, input);
};

export const editCarImage = async (
  carId: number,
  imageId: number,
  input: UpdateCarImageInput,
): Promise<CarImage> => {
  const image = await findCarImageById(
    carId,
    imageId,
  );

  if (!image) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_IMAGE_NOT_FOUND",
      message: "Car image not found.",
    });
  }

  await updateCarImage(
    carId,
    imageId,
    input,
  );

  const updated = await findCarImageById(
    carId,
    imageId,
  );

  if (!updated) {
    throw new Error(
      "The updated car image could not be retrieved.",
    );
  }

  return updated;
};

export const makeCarImagePrimary = async (
  carId: number,
  imageId: number,
): Promise<CarImage> => {
  const image = await findCarImageById(
    carId,
    imageId,
  );

  if (!image) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_IMAGE_NOT_FOUND",
      message: "Car image not found.",
    });
  }

  await setPrimaryCarImage(
    carId,
    imageId,
  );

  const updated = await findCarImageById(
    carId,
    imageId,
  );

  if (!updated) {
    throw new Error(
      "The primary car image could not be retrieved.",
    );
  }

  return updated;
};

export const reorderImagesForCar = async (
  carId: number,
  input: ReorderCarImagesInput,
): Promise<CarImage[]> => {
  const car = await findCarById(carId);

  if (!car) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_NOT_FOUND",
      message: "Car not found.",
    });
  }

  await reorderCarImages(carId, input);

  return findCarImages(carId);
};

export const removeCarImage = async (
  carId: number,
  imageId: number,
): Promise<void> => {
  const image = await findCarImageById(
    carId,
    imageId,
  );

  if (!image) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_IMAGE_NOT_FOUND",
      message: "Car image not found.",
    });
  }

  const deleted = await deleteCarImage(
    carId,
    imageId,
  );

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "CAR_IMAGE_NOT_FOUND",
      message: "Car image not found.",
    });
  }

  if (image.image_url.startsWith("/uploads/")) {
    const relativePath = image.image_url.replace(
      "/uploads/",
      "",
    );

    const filePath = path.resolve(
      process.cwd(),
      "uploads",
      relativePath,
    );

    await fs.unlink(filePath).catch(() => undefined);
  }
};