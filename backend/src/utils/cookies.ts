import type { CookieOptions, Response } from "express";

import { env } from "../config/env.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
};

export const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  response.cookie(
    env.ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    cookieOptions,
  );

  response.cookie(
    env.REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    cookieOptions,
  );
};

export const clearAuthCookies = (
  response: Response,
): void => {
  response.clearCookie(
    env.ACCESS_TOKEN_COOKIE_NAME,
    cookieOptions,
  );

  response.clearCookie(
    env.REFRESH_TOKEN_COOKIE_NAME,
    cookieOptions,
  );
};