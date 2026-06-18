import { auth } from "@/lib/auth";

/**
 * BetterAuth API route handler
 * Handles all authentication endpoints:
 * - /api/auth/sign-up
 * - /api/auth/sign-in
 * - /api/auth/sign-out
 * - /api/auth/session
 * - etc.
 */

export const { POST, GET } = auth.toNextJsHandler();
