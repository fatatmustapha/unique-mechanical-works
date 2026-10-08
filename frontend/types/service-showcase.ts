export type ServiceShowcaseImageType =
  | "before"
  | "after";

export type ServiceShowcaseImage = {
  image_id: number;
  showcase_id: number;
  image_type: ServiceShowcaseImageType;
  image_url: string;
  created_at: string;
};

export type ServiceShowcase = {
  showcase_id: number;

  title: string;
  description: string | null;

  service_id: number | null;
  service_name: string | null;

  branch_id: number | null;
  branch_name: string | null;

  is_active: boolean;

  before_images: ServiceShowcaseImage[];
  after_images: ServiceShowcaseImage[];

  created_at: string;
  updated_at: string;
};

export type ServiceShowcaseFormInput = {
  title: string;

  description?: string;

  service_id?: number | null;
  branch_id?: number | null;

  is_active?: boolean;

  before_images?: File[];
  after_images?: File[];
};