import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables. Importing this module fails fast at build/start if anything
 * is malformed. Add new variables here AND in `.env.example`. Server-only secrets must never be
 * prefixed with NEXT_PUBLIC_, and this module's server values must only be read in server code.
 *
 * Accounts are optional: without DATABASE_URL + AUTH_SECRET + a sign-in method, the site runs in
 * guest mode (builder with local drafts only).
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters").optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    /** Address the PDF browser uses to open /print. Defaults to NEXT_PUBLIC_SITE_URL. */
    PDF_BASE_URL: z.string().url().optional(),
    /** Development only: 1 removes the PDF watermark so you can check the clean output. */
    DEV_PRO_UNLOCK: z.string().optional(),
    /** Payments (Lemon Squeezy). All six are needed together; see docs/billing.md. */
    LEMONSQUEEZY_API_KEY: z.string().optional(),
    LEMONSQUEEZY_STORE_ID: z.string().optional(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
    LEMONSQUEEZY_VARIANT_MONTHLY: z.string().optional(),
    LEMONSQUEEZY_VARIANT_YEARLY: z.string().optional(),
    LEMONSQUEEZY_VARIANT_PASS: z.string().optional(),
    /** Discount code (created in the provider dashboard) applied automatically for academic emails. */
    STUDENT_DISCOUNT_CODE: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    PDF_BASE_URL: process.env.PDF_BASE_URL,
    DEV_PRO_UNLOCK: process.env.DEV_PRO_UNLOCK,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZY_VARIANT_MONTHLY: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
    LEMONSQUEEZY_VARIANT_YEARLY: process.env.LEMONSQUEEZY_VARIANT_YEARLY,
    LEMONSQUEEZY_VARIANT_PASS: process.env.LEMONSQUEEZY_VARIANT_PASS,
    STUDENT_DISCOUNT_CODE: process.env.STUDENT_DISCOUNT_CODE,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
  emptyStringAsUndefined: true,
});
