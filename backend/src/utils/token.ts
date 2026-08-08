import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getTokenExpiration = (token: string): Date => {
  const decoded = jwt.decode(token);

  if (
    !decoded ||
    typeof decoded === "string" ||
    typeof decoded.exp !== "number"
  ) {
    throw new Error("The token does not contain a valid expiration time.");
  }

  return new Date(decoded.exp * 1000);
};