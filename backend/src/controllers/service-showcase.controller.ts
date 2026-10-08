import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  createAdminServiceShowcase,
  getAdminServiceShowcase,
  getAdminServiceShowcases,
  getPublicServiceShowcases,
  removeAdminServiceShowcase,
  removeAdminServiceShowcaseImage,
  setAdminServiceShowcaseStatus,
  updateAdminServiceShowcase,
} from "../services/service-showcase.service.js";

import {
  createServiceShowcaseSchema,
  showcaseIdParamSchema,
  showcaseImageIdParamSchema,
  updateServiceShowcaseSchema,
  updateServiceShowcaseStatusSchema,
} from "../validators/service-showcase.validator.js";

import { sendSuccess } from "../utils/api-response.js";

type ShowcaseFiles = {
  before_images?: Express.Multer.File[];
  after_images?: Express.Multer.File[];
};

const getUploadedFiles = (
  request: Request,
): ShowcaseFiles => {
  return (
    request.files as ShowcaseFiles | undefined
  ) ?? {};
};

const getImageUrls = (
  files: Express.Multer.File[] | undefined,
): string[] => {
  if (!files) {
    return [];
  }

  return files.map(
    (file) =>
      `/uploads/service-showcases/${file.filename}`,
  );
};

export const getPublicShowcases = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const showcases =
      await getPublicServiceShowcases();

    sendSuccess(
      response,
      200,
      showcases,
      "Service showcases retrieved successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminShowcases = async (
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const showcases =
      await getAdminServiceShowcases();

    sendSuccess(
      response,
      200,
      showcases,
      "Service showcases retrieved successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminShowcase = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      showcaseIdParamSchema.parse(
        request.params,
      );

    const showcase =
      await getAdminServiceShowcase(id);

    sendSuccess(
      response,
      200,
      showcase,
      "Service showcase retrieved successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const createAdminShowcase = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input =
      createServiceShowcaseSchema.parse(
        request.body,
      );

    const files = getUploadedFiles(request);

    const beforeImageUrls = getImageUrls(
      files.before_images,
    );

    const afterImageUrls = getImageUrls(
      files.after_images,
    );

    const showcase =
      await createAdminServiceShowcase(
        input,
        beforeImageUrls,
        afterImageUrls,
      );

    sendSuccess(
      response,
      201,
      showcase,
      "Service showcase created successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const updateAdminShowcase = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      showcaseIdParamSchema.parse(
        request.params,
      );

    const input =
      updateServiceShowcaseSchema.parse(
        request.body,
      );

    const files = getUploadedFiles(request);

    const beforeImageUrls = getImageUrls(
      files.before_images,
    );

    const afterImageUrls = getImageUrls(
      files.after_images,
    );

    const showcase =
      await updateAdminServiceShowcase(
        id,
        input,
        beforeImageUrls,
        afterImageUrls,
      );

    sendSuccess(
      response,
      200,
      showcase,
      "Service showcase updated successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const patchAdminShowcaseStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      showcaseIdParamSchema.parse(
        request.params,
      );

    const { is_active } =
      updateServiceShowcaseStatusSchema.parse(
        request.body,
      );

    const showcase =
      await setAdminServiceShowcaseStatus(
        id,
        is_active,
      );

    sendSuccess(
      response,
      200,
      showcase,
      "Service showcase status updated successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAdminShowcaseImage = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, imageId } =
      showcaseImageIdParamSchema.parse(
        request.params,
      );

    const showcase =
      await removeAdminServiceShowcaseImage(
        id,
        imageId,
      );

    sendSuccess(
      response,
      200,
      showcase,
      "Showcase image removed successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAdminShowcase = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } =
      showcaseIdParamSchema.parse(
        request.params,
      );

    await removeAdminServiceShowcase(id);

    sendSuccess(
      response,
      200,
      null,
      "Service showcase deleted successfully.",
    );
  } catch (error) {
    next(error);
  }
};