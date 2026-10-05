export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "reschedule_requested"
  | "completed"
  | "cancelled";

export type Branch = {
  branch_id: number;
  name: string;
  city: string;
  state: string | null;
  address: string;
  phone: string;
  whatsapp_number: string | null;
  email: string | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  opened_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  service_id: number;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type BranchService = {
  branch_service_id: number;
  branch_id: number;
  branch_name: string;
  service_id: number;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  appointment_id: number;
  customer_id: number;

  customer_first_name: string;
  customer_last_name: string;

  service_id: number;
  service_name: string;

  branch_id: number;
  branch_name: string;

  scheduled_at: string;

  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate_number: string | null;

  customer_notes: string | null;
  admin_notes: string | null;

  status: AppointmentStatus;

  cancelled_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

export type CreateAppointmentInput = {
  service_id: number;
  branch_id: number;
  scheduled_at: string;

  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: number | null;
  vehicle_plate_number?: string | null;
  customer_notes?: string | null;
};

export type RescheduleAppointmentInput = {
  scheduled_at: string;
};
