import { apiRequest } from "@/lib/api/client";

import type {
  ServiceShowcase,
  ServiceShowcaseFormInput,
} from "@/types/service-showcase";

type ServiceShowcasesResponse = {
  success: boolean;
  data: ServiceShowcase[];
  message: string;
};

type ServiceShowcaseResponse = {
  success: boolean;
  data: ServiceShowcase;
  message: string;
};

type DeleteServiceShowcaseResponse = {
  success: boolean;
  data: null;
  message: string;
};

const buildShowcaseFormData = (
  input: ServiceShowcaseFormInput,
): FormData => {
  const formData = new FormData();

  formData.append("title", input.title);

  if (input.description !== undefined) {
    formData.append(
      "description",
      input.description,
    );
  }

  if (input.service_id !== undefined) {
    formData.append(
      "service_id",
      input.service_id === null
        ? ""
        : String(input.service_id),
    );
  }

  if (input.branch_id !== undefined) {
    formData.append(
      "branch_id",
      input.branch_id === null
        ? ""
        : String(input.branch_id),
    );
  }

  if (input.is_active !== undefined) {
    formData.append(
      "is_active",
      String(input.is_active),
    );
  }

  for (const file of input.before_images ?? []) {
    formData.append("before_images", file);
  }

  for (const file of input.after_images ?? []) {
    formData.append("after_images", file);
  }

  return formData;
};

export const getPublicServiceShowcases =
  async (): Promise<ServiceShowcase[]> => {
    const response =
      await apiRequest<ServiceShowcasesResponse>(
        "/service-showcases",
        {
          method: "GET",
        },
      );

    return response.data;
  };

export const getAdminServiceShowcases =
  async (): Promise<ServiceShowcase[]> => {
    const response =
      await apiRequest<ServiceShowcasesResponse>(
        "/service-showcases/admin",
        {
          method: "GET",
        },
      );

    return response.data;
  };

export const createServiceShowcase = async (
  input: ServiceShowcaseFormInput,
): Promise<ServiceShowcase> => {
  const response =
    await apiRequest<ServiceShowcaseResponse>(
      "/service-showcases/admin",
      {
        method: "POST",
        body: buildShowcaseFormData(input),
      },
    );

  return response.data;
};

export const updateServiceShowcase = async (
  showcaseId: number,
  input: ServiceShowcaseFormInput,
): Promise<ServiceShowcase> => {
  const response =
    await apiRequest<ServiceShowcaseResponse>(
      `/service-showcases/admin/${showcaseId}`,
      {
        method: "PUT",
        body: buildShowcaseFormData(input),
      },
    );

  return response.data;
};

export const setServiceShowcaseStatus = async (
  showcaseId: number,
  isActive: boolean,
): Promise<ServiceShowcase> => {
  const response =
    await apiRequest<ServiceShowcaseResponse>(
      `/service-showcases/admin/${showcaseId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          is_active: isActive,
        }),
      },
    );

  return response.data;
};

export const deleteServiceShowcaseImage = async (
  showcaseId: number,
  imageId: number,
): Promise<ServiceShowcase> => {
  const response =
    await apiRequest<ServiceShowcaseResponse>(
      `/service-showcases/admin/${showcaseId}/images/${imageId}`,
      {
        method: "DELETE",
      },
    );

  return response.data;
};

export const deleteServiceShowcase = async (
  showcaseId: number,
): Promise<void> => {
  await apiRequest<DeleteServiceShowcaseResponse>(
    `/service-showcases/admin/${showcaseId}`,
    {
      method: "DELETE",
    },
  );
};