import fs from "node:fs/promises";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  addCarImage,
  editCarImage,
  getCarImages,
  makeCarImagePrimary,
  removeCarImage,
  reorderImagesForCar,
} from "../services/car-image.service.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  carIdImageParamSchema,
  carImageParamsSchema,
  reorderCarImagesSchema,
  updateCarImageSchema,
  uploadCarImageMetadataSchema,
} from "../validators/car-image.validator.js";

export const getImagesForCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      carIdImageParamSchema.parse(
        request.params,
      );

    const images = await getCarImages(id);

    sendSuccess(
      response,
      200,
      images,
      "Car images retrieved successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const createImageForCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      carIdImageParamSchema.parse(
        request.params,
      );

    if (!request.file) {
      response.status(400).json({
        success: false,
        error: {
          code: "IMAGE_FILE_REQUIRED",
          message: "A car image file is required.",
          details: [],
        },
      });

      return;
    }

    const metadata =
      uploadCarImageMetadataSchema.parse(
        request.body,
      );

    const imageUrl =
      `/uploads/cars/${request.file.filename}`;

    try {
      const image = await addCarImage(
        id,
        {
          image_url: imageUrl,
          image_label:
            metadata.image_label,
          alt_text:
            metadata.alt_text ?? null,
          is_primary:
            metadata.is_primary,
          sort_order:
            metadata.sort_order,
        },
      );

      sendSuccess(
        response,
        201,
        { image },
        "Car image uploaded successfully.",
      );
    } catch (error: unknown) {
      await fs.unlink(request.file.path).catch(
        () => undefined,
      );

      throw error;
    }
  } catch (error: unknown) {
    next(error);
  }
};

export const updateImageForCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, imageId } =
      carImageParamsSchema.parse(
        request.params,
      );

    const input =
      updateCarImageSchema.parse(
        request.body,
      );

    const image = await editCarImage(
      id,
      imageId,
      input,
    );

    sendSuccess(
      response,
      200,
      { image },
      "Car image updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const setPrimaryImageForCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, imageId } =
      carImageParamsSchema.parse(
        request.params,
      );

    const image =
      await makeCarImagePrimary(
        id,
        imageId,
      );

    sendSuccess(
      response,
      200,
      { image },
      "Primary car image updated successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};

export const reorderImagesForCarController =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } =
        carIdImageParamSchema.parse(
          request.params,
        );

      const input =
        reorderCarImagesSchema.parse(
          request.body,
        );

      const images =
        await reorderImagesForCar(
          id,
          input,
        );

      sendSuccess(
        response,
        200,
        images,
        "Car images reordered successfully.",
      );
    } catch (error: unknown) {
      next(error);
    }
  };

export const deleteImageForCar = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, imageId } =
      carImageParamsSchema.parse(
        request.params,
      );

    await removeCarImage(
      id,
      imageId,
    );

    sendSuccess(
      response,
      200,
      {},
      "Car image deleted successfully.",
    );
  } catch (error: unknown) {
    next(error);
  }
};