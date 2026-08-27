export type Transmission = "Automatic" | "Manual";

export type FuelType =
  | "Petrol"
  | "Diesel"
  | "Hybrid"
  | "Electric";

export type SaleStatus =
  | "available"
  | "reserved"
  | "sold";

export type PublicationStatus =
  | "draft"
  | "published"
  | "archived";

export type Car = {
  car_id: number;
  reference_number: string;
  slug: string;

  branch_id: number;
  branch_name: string;

  make: string;
  model: string;

  year: number | null;
  price: number;
  mileage: number | null;

  transmission: Transmission | null;
  fuel_type: FuelType | null;
  body_type: string | null;

  description: string | null;

  sale_status: SaleStatus;
  publication_status: PublicationStatus;

  is_featured?: boolean;

  color_exterior: string | null;
  color_interior: string | null;

  engine_size: string | null;
  horsepower: number | null;

  drivetrain:
    | "FWD"
    | "RWD"
    | "AWD"
    | "4WD"
    | null;

  negotiable: boolean;

  features: string[] | null;

  views_count?: number;

  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

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

  alt_text: string | null;

  is_primary: boolean;

  sort_order: number;

  created_at: string;
};

export type CarsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CarsResponse = {
  success: boolean;
  data: Car[];
  pagination: CarsPagination;
  message?: string;
};

export type CarImagesResponse = {
  success: boolean;
  data: CarImage[];
  message?: string;
};