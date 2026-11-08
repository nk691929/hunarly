import { env } from "@/config/env";
import { resolveAuthStatus } from "@/features/auth/status";

/** Which account features this server has. Server-only: reads secrets-adjacent env values. */
export const authStatus = resolveAuthStatus(env);
