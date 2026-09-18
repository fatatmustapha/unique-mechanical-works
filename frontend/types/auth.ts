export type AdminRole =
  | "super_admin"
  | "branch_admin";

export type Admin = {
  admin_id: number;
  full_name?: string;
  email: string;
  role: AdminRole;
  branch_id: number | null;
  is_active: boolean;
};

export type AdminLoginResponse = {
  success: boolean;

  data: {
    admin: Admin;
  };

  message: string;
};

export type CurrentUserResponse = {
  success: boolean;

  data: {
    accountType: "admin";
    admin: Admin;
  };

  message: string;
};

export type LogoutResponse = {
  success: boolean;
  data: Record<string, never>;
  message: string;
};