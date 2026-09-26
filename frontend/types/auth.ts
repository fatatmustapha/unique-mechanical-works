export type AdminRole =
  | "super_admin"
  | "branch_admin";

export type Admin = {
  admin_id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email: string;
  role: AdminRole;
  branch_id: number | null;
  is_active: boolean;
};

export type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  preferred_branch_id: number | null;
  avatar_url: string | null;
  address: string | null;
  is_active: boolean;
};

export type AdminLoginResponse = {
  success: boolean;
  data: {
    admin: Admin;
  };
  message: string;
};

export type CustomerRegisterResponse = {
  success: boolean;
  data: {
    customer: Customer;
  };
  message: string;
};

export type CustomerLoginResponse = {
  success: boolean;
  data: {
    customer: Customer;
  };
  message: string;
};

export type CurrentUserResponse = {
  success: boolean;
  data:
    | {
        accountType: "admin";
        admin: Admin;
      }
    | {
        accountType: "customer";
        customer: Customer;
      };
  message: string;
};

export type LogoutResponse = {
  success: boolean;
  data: Record<string, never>;
  message: string;
};