import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import type {
  AccountType,
  AdminRole,
} from "../types/auth.js";
import { env } from "./env.js";

export interface JwtPayload {
  id: number;
  accountType: AccountType;
  adminRole?: AdminRole;
  branchId?: number | null;
}

const createToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);
};

export const generateAccessToken = (
  payload: JwtPayload,
): string => {
  return createToken(
    payload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );
};

export const generateRefreshToken = (
  payload: JwtPayload,
): string => {
  return createToken(
    payload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );
};

export const verifyAccessToken = (
  token: string,
): JwtPayload => {
  return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  ) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string,
): JwtPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
  ) as JwtPayload;
};