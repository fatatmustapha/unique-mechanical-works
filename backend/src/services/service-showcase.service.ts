import { AppError } from "../errors/app-error.js";

import {
  addServiceShowcaseImages,
  countActiveServiceShowcases,
  countServiceShowcaseImages,
  createServiceShowcase,
  deleteServiceShowcase,
  deleteServiceShowcaseImage,
  findActiveServiceShowcases,
  findAllServiceShowcases,
  findServiceShowcaseById,
  updateServiceShowcase,
  updateServiceShowcaseStatus,
} from "../repositories/service-showcase.repository.js";

import type {
  ServiceShowcase,
  ShowcaseImageType,
} from "../repositories/service-showcase.repository.js";

import type {
  CreateServiceShowcaseInput,
  UpdateServiceShowcaseInput,
} from "../validators/service-showcase.validator.js";

const MAX_ACTIVE_SHOWCASES = 6;
const MAX_IMAGES_PER_TYPE = 6;

/*
|--------------------------------------------------------------------------
| Public showcases
|--------------------------------------------------------------------------
*/

export const getPublicServiceShowcases = async (): Promise<
  ServiceShowcase[]
> => {
  return findActiveServiceShowcases();
};

/*
|--------------------------------------------------------------------------
| Admin showcases
|--------------------------------------------------------------------------
*/

export const getAdminServiceShowcases = async (): Promise<
  ServiceShowcase[]
> => {
  return findAllServiceShowcases();
};

export const getAdminServiceShowcase = async (
  showcaseId: number,
): Promise<ServiceShowcase> => {
  const showcase = await findServiceShowcaseById(showcaseId);

  if (!showcase) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_SHOWCASE_NOT_FOUND",
      message: "Service showcase was not found.",
    });
  }

  return showcase;
};

/*
|--------------------------------------------------------------------------
| Limits
|--------------------------------------------------------------------------
*/

const ensureActiveLimit = async (): Promise<void> => {
  const activeCount = await countActiveServiceShowcases();

  if (activeCount >= MAX_ACTIVE_SHOWCASES) {
    throw new AppError({
      statusCode: 400,
      code: "SERVICE_SHOWCASE_LIMIT_REACHED",
      message: `A maximum of ${MAX_ACTIVE_SHOWCASES} showcases can be displayed at the same time.`,
    });
  }
};

const ensureImageLimit = (
  existingCount: number,
  newCount: number,
  imageType: ShowcaseImageType,
): void => {
  if (existingCount + newCount > MAX_IMAGES_PER_TYPE) {
    throw new AppError({
      statusCode: 400,
      code: "SERVICE_SHOWCASE_IMAGE_LIMIT_REACHED",
      message: `A showcase can have a maximum of ${MAX_IMAGES_PER_TYPE} ${imageType} images.`,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create showcase
|--------------------------------------------------------------------------
*/

export const createAdminServiceShowcase = async (
  input: CreateServiceShowcaseInput,
  beforeImageUrls: string[],
  afterImageUrls: string[],
): Promise<ServiceShowcase> => {
  if (beforeImageUrls.length === 0) {
    throw new AppError({
      statusCode: 400,
      code: "BEFORE_IMAGE_REQUIRED",
      message: "At least one before image is required.",
    });
  }

  if (afterImageUrls.length === 0) {
    throw new AppError({
      statusCode: 400,
      code: "AFTER_IMAGE_REQUIRED",
      message: "At least one after image is required.",
    });
  }

  ensureImageLimit(0, beforeImageUrls.length, "before");

  ensureImageLimit(0, afterImageUrls.length, "after");

  if (input.is_active ?? true) {
    await ensureActiveLimit();
  }

  const showcaseId = await createServiceShowcase(input);

  await addServiceShowcaseImages(showcaseId, "before", beforeImageUrls);

  await addServiceShowcaseImages(showcaseId, "after", afterImageUrls);

  return getAdminServiceShowcase(showcaseId);
};

/*
|--------------------------------------------------------------------------
| Update showcase
|--------------------------------------------------------------------------
*/

export const updateAdminServiceShowcase = async (
  showcaseId: number,
  input: UpdateServiceShowcaseInput,
  beforeImageUrls: string[],
  afterImageUrls: string[],
): Promise<ServiceShowcase> => {
  const existing = await getAdminServiceShowcase(showcaseId);

  /*
   * Only check the active limit when an archived
   * showcase is being activated.
   */
  if (input.is_active === true && !existing.is_active) {
    await ensureActiveLimit();
  }

  /*
   * New images are added to the existing gallery,
   * so existing + new may never exceed six.
   */
  if (beforeImageUrls.length > 0) {
    const existingBeforeCount = await countServiceShowcaseImages(
      showcaseId,
      "before",
    );

    ensureImageLimit(existingBeforeCount, beforeImageUrls.length, "before");
  }

  if (afterImageUrls.length > 0) {
    const existingAfterCount = await countServiceShowcaseImages(
      showcaseId,
      "after",
    );

    ensureImageLimit(existingAfterCount, afterImageUrls.length, "after");
  }

  await updateServiceShowcase(showcaseId, input);

  await addServiceShowcaseImages(showcaseId, "before", beforeImageUrls);

  await addServiceShowcaseImages(showcaseId, "after", afterImageUrls);

  return getAdminServiceShowcase(showcaseId);
};

/*
|--------------------------------------------------------------------------
| Archive / Restore
|--------------------------------------------------------------------------
*/

export const setAdminServiceShowcaseStatus = async (
  showcaseId: number,
  isActive: boolean,
): Promise<ServiceShowcase> => {
  const existing = await getAdminServiceShowcase(showcaseId);

  if (isActive && !existing.is_active) {
    await ensureActiveLimit();
  }

  await updateServiceShowcaseStatus(showcaseId, isActive);

  return getAdminServiceShowcase(showcaseId);
};

/*
|--------------------------------------------------------------------------
| Delete individual gallery image
|--------------------------------------------------------------------------
*/

export const removeAdminServiceShowcaseImage = async (
  showcaseId: number,
  imageId: number,
): Promise<ServiceShowcase> => {
  const showcase = await getAdminServiceShowcase(showcaseId);

  const image = [...showcase.before_images, ...showcase.after_images].find(
    (item) => item.image_id === imageId,
  );

  if (!image) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_SHOWCASE_IMAGE_NOT_FOUND",
      message: "Showcase image was not found.",
    });
  }

  const relevantImages =
    image.image_type === "before"
      ? showcase.before_images
      : showcase.after_images;

  /*
   * Every showcase must always keep at least
   * one Before and one After image.
   */
  if (relevantImages.length <= 1) {
    throw new AppError({
      statusCode: 400,
      code: "SERVICE_SHOWCASE_IMAGE_REQUIRED",
      message: `A showcase must keep at least one ${image.image_type} image.`,
    });
  }

  const deleted = await deleteServiceShowcaseImage(showcaseId, imageId);

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_SHOWCASE_IMAGE_NOT_FOUND",
      message: "Showcase image was not found.",
    });
  }

  return getAdminServiceShowcase(showcaseId);
};

/*
|--------------------------------------------------------------------------
| Delete showcase
|--------------------------------------------------------------------------
*/

export const removeAdminServiceShowcase = async (
  showcaseId: number,
): Promise<void> => {
  await getAdminServiceShowcase(showcaseId);

  const deleted = await deleteServiceShowcase(showcaseId);

  if (!deleted) {
    throw new AppError({
      statusCode: 404,
      code: "SERVICE_SHOWCASE_NOT_FOUND",
      message: "Service showcase was not found.",
    });
  }
};
