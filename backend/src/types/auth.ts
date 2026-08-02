export interface AuthenticatedUser {
  id: number;
  role: "customer" | "admin";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}