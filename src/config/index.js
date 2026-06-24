import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REDIRECT_URI: z.string().default("http://localhost:3000/api/v1/auth/google/callback"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  MIDTRANS_SERVER_KEY: z.string().default(""),
  MIDTRANS_CLIENT_KEY: z.string().default(""),
  MIDTRANS_IS_PRODUCTION: z.string().default("false"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
