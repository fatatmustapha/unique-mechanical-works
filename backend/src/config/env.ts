import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().max(65535).default(5000),

  FRONTEND_URL: z.url(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().max(65535).default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("7d"),

  ACCESS_TOKEN_COOKIE_NAME: z.string().min(1).default("umw_access_token"),
  REFRESH_TOKEN_COOKIE_NAME: z.string().min(1).default("umw_refresh_token"),

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false),

  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid backend environment configuration.");

  for (const issue of parsedEnvironment.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  throw new Error("Environment validation failed.");
}

export const env = parsedEnvironment.data;