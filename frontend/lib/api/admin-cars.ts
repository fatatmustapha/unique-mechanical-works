import { apiRequest } from "@/lib/api/client";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type AdminCar = {
  car_id: number;
  reference_number: string;
  slug: string;
  vin: string | null;

  branch_id: number;
  branch_name: string;

  make: string;
  model: string;
  year: number | null;

  price: number;
  mileage: number | null;

  condition_type:
    | "New"
    | "Nigerian Used"
    | "Foreign Used"
    | null;

  transmission:
    | "Automatic"
    | "Manual"
    | null;

  fuel_type:
    | "Petrol"
    | "Diesel"
    | "Hybrid"
    | "Electric"
    | null;

  description: string | null;

  sale_status:
    | "available"
    | "reserved"
    | "sold";

  publication_status:
    | "draft"
    | "published"
    | "archived";

  is_featured: boolean;

  color_exterior: string | null;
  color_interior: string | null;

  engine_size: string | null;
  horsepower: number | null;

  body_type: string | null;

  num_doors: number | null;
  num_seats: number | null;

  drivetrain:
    | "FWD"
    | "RWD"
    | "AWD"
    | "4WD"
    | null;

  registration_status:
    | string
    | null;

  num_previous_owners:
    | number
    | null;

  import_status:
    | string
    | null;

  negotiable: boolean;

  features:
    | string[]
    | null;

  warranty_status:
    | string
    | null;

  views_count: number;

  published_at:
    | string
    | null;

  created_at: string;
  updated_at: string;
};

export type AdminCarsResponse = {
  success: boolean;

  data: AdminCar[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  message: string;
};

export type GetAdminCarsParams = {
  page?: number;
  limit?: number;
  search?: string;

  publication_status?:
    | "draft"
    | "published"
    | "archived";

  sale_status?:
    | "available"
    | "reserved"
    | "sold";

  featured?: boolean;

  branch_id?: number;

  sort?:
    | "latest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "year_asc"
    | "year_desc";
};

/*
|--------------------------------------------------------------------------
| CREATE VEHICLE TYPES
|--------------------------------------------------------------------------
*/

export type CreateAdminCarInput = {
  reference_number: string;
  slug: string;
  branch_id: number;

  make: string;
  model: string;
  price: number;

  vin?: string | null;
  year?: number;
  mileage?: number;

  condition_type?:
    | "New"
    | "Nigerian Used"
    | "Foreign Used";

  transmission?:
    | "Automatic"
    | "Manual";

  fuel_type?:
    | "Petrol"
    | "Diesel"
    | "Hybrid"
    | "Electric";

  description?:
    | string
    | null;

  color_exterior?:
    | string
    | null;

  color_interior?:
    | string
    | null;

  engine_size?:
    | string
    | null;

  horsepower?: number;

  body_type?:
    | string
    | null;

  num_doors?: number;
  num_seats?: number;

  drivetrain?:
    | "FWD"
    | "RWD"
    | "AWD"
    | "4WD";

  registration_status?:
    | string
    | null;

  num_previous_owners?: number;

  import_status?:
    | string
    | null;

  negotiable?: boolean;

  features?: string[];

  warranty_status?:
    | string
    | null;
};

export type CreateAdminCarResponse = {
  success: boolean;

  data: {
    car: AdminCar;
  };

  message: string;
};

/*
|--------------------------------------------------------------------------
| IMAGE TYPES
|--------------------------------------------------------------------------
*/

export type CarImage = {
  image_id: number;
  car_id: number;

  image_url: string;

  image_label:
    | "front"
    | "back"
    | "side"
    | "interior"
    | "engine"
    | "other";

  alt_text:
    | string
    | null;

  is_primary: boolean;

  sort_order: number;

  created_at: string;
};

export type UploadCarImageResponse = {
  success: boolean;

  data: {
    image: CarImage;
  };

  message: string;
};

export type UploadCarImageOptions = {
  imageLabel?:
    | "front"
    | "back"
    | "side"
    | "interior"
    | "engine"
    | "other";

  altText?: string;

  isPrimary?: boolean;

  sortOrder?: number;
};

/*
|--------------------------------------------------------------------------
| GET ADMIN VEHICLES
|--------------------------------------------------------------------------
*/

export async function getAdminCars(
  params: GetAdminCarsParams = {},
): Promise<AdminCarsResponse> {
  const searchParams =
    new URLSearchParams();

  if (
    params.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.limit !== undefined
  ) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (
    params.publication_status
  ) {
    searchParams.set(
      "publication_status",
      params.publication_status,
    );
  }

  if (params.sale_status) {
    searchParams.set(
      "sale_status",
      params.sale_status,
    );
  }

  if (
    params.featured !== undefined
  ) {
    searchParams.set(
      "featured",
      String(params.featured),
    );
  }

  if (
    params.branch_id !== undefined
  ) {
    searchParams.set(
      "branch_id",
      String(params.branch_id),
    );
  }

  if (params.sort) {
    searchParams.set(
      "sort",
      params.sort,
    );
  }

  const query =
    searchParams.toString();

  return apiRequest<AdminCarsResponse>(
    `/admin/cars${
      query
        ? `?${query}`
        : ""
    }`,
    {
      method: "GET",
    },
  );
}

/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
*/

export async function createAdminCar(
  input: CreateAdminCarInput,
): Promise<CreateAdminCarResponse> {
  return apiRequest<CreateAdminCarResponse>(
    "/admin/cars",
    {
      method: "POST",

      body:
        JSON.stringify(input),
    },
  );
}

/*
|--------------------------------------------------------------------------
| FEATURE VEHICLE
|--------------------------------------------------------------------------
*/

export async function toggleAdminCarFeatured(
  carId: number,
) {
  return apiRequest<{
    success: boolean;

    data: {
      car: AdminCar;
    };

    message: string;
  }>(
    `/admin/cars/${carId}/featured`,
    {
      method: "PATCH",
    },
  );
}

/*
|--------------------------------------------------------------------------
| PUBLICATION STATUS
|--------------------------------------------------------------------------
*/

export async function updateAdminCarPublication(
  carId: number,

  status:
    | "published"
    | "archived",
) {
  return apiRequest<{
    success: boolean;

    data: {
      car: AdminCar;
    };

    message: string;
  }>(
    `/admin/cars/${carId}/publication`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status,
        }),
    },
  );
}

/*
|--------------------------------------------------------------------------
| SALE STATUS
|--------------------------------------------------------------------------
*/

export async function updateAdminCarSaleStatus(
  carId: number,

  status:
    | "available"
    | "sold",
) {
  return apiRequest<{
    success: boolean;

    data: {
      car: AdminCar;
    };

    message: string;
  }>(
    `/admin/cars/${carId}/status`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status,
        }),
    },
  );
}

/*
|--------------------------------------------------------------------------
| DELETE DRAFT VEHICLE
|--------------------------------------------------------------------------
*/

export async function deleteAdminCar(
  carId: number,
) {
  return apiRequest<{
    success: boolean;

    data:
      Record<string, never>;

    message: string;
  }>(
    `/admin/cars/${carId}`,
    {
      method: "DELETE",
    },
  );
}

/*
|--------------------------------------------------------------------------
| UPLOAD VEHICLE IMAGE
|--------------------------------------------------------------------------
*/

export async function uploadAdminCarImage(
  carId: number,
  file: File,
  options: UploadCarImageOptions = {},
): Promise<UploadCarImageResponse> {
  const formData =
    new FormData();

  formData.append(
    "image",
    file,
  );

  formData.append(
    "image_label",
    options.imageLabel ??
      "other",
  );

  if (options.altText) {
    formData.append(
      "alt_text",
      options.altText,
    );
  }

  formData.append(
    "is_primary",
    String(
      options.isPrimary ??
        false,
    ),
  );

  formData.append(
    "sort_order",
    String(
      options.sortOrder ??
        0,
    ),
  );

  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

    const uploadImage = () =>
    fetch(
      `${apiUrl}/cars/${carId}/images`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

  let response =
    await uploadImage();

  // If the access token expired,
  // refresh the session and retry once.
  if (response.status === 401) {
    const refreshResponse =
      await fetch(
        `${apiUrl}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

    if (refreshResponse.ok) {
      response =
        await uploadImage();
    }
  }

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      `Image upload failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as UploadCarImageResponse;
}