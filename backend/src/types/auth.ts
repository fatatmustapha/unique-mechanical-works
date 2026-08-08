export type AccountType = "customer" | "admin";
export type AdminRole = "super_admin" | "branch_admin";

export interface AuthenticatedUser {
  id: number;
  accountType: AccountType;
  adminRole?: AdminRole;
  branchId?: number | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}