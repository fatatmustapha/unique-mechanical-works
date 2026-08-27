import { apiRequest } from "@/lib/api/client";
import { BACKEND_URL } from "@/lib/constants/env";

import type {
  Car,
  CarImage,
  CarImagesResponse,
  CarsResponse,
  FuelType,
  Transmission,
} from "@/types/car";

export type CarsQuery = {
  page?: number;
  limit?: number;

  transmission?: Transmission;
  fuel_type?: FuelType;
  body_type?: string;

  sort?:
    | "latest"
    | "price_asc"
    | "price_desc"
    | "year_asc"
    | "year_desc";
};

export type CarResponse = {
  success: boolean;
  data: Car;
  message?: string;
};

export async function getCars(
  query: CarsQuery = {},
): Promise<CarsResponse> {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.transmission) {
    params.set(
      "transmission",
      query.transmission,
    );
  }

  if (query.fuel_type) {
    params.set(
      "fuel_type",
      query.fuel_type,
    );
  }

  if (query.body_type) {
    params.set(
      "body_type",
      query.body_type,
    );
  }

  if (query.sort) {
    params.set("sort", query.sort);
  }

  const queryString = params.toString();

  return apiRequest<CarsResponse>(
    `/cars${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      skipCredentials: true,
    },
  );
}

export async function getCarBySlug(
  slug: string,
): Promise<CarResponse> {
  return apiRequest<CarResponse>(
    `/cars/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      skipCredentials: true,
    },
  );
}

export async function getCarImages(
  carId: number,
): Promise<CarImagesResponse> {
  return apiRequest<CarImagesResponse>(
    `/cars/${carId}/images`,
    {
      method: "GET",
      skipCredentials: true,
    },
  );
}

export function getCarImageUrl(
  image: CarImage | undefined,
): string {
  if (!image) {
    return "/images/home/hero/hero.png";
  }

  if (
    image.image_url.startsWith("http://") ||
    image.image_url.startsWith("https://")
  ) {
    return image.image_url;
  }

  return `${BACKEND_URL}${image.image_url}`;
}