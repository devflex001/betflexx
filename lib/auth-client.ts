"use client";

import { createAuthClient } from "better-auth/react";
import type { Session, User } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
  credentials: "include",
});

// Export auth hooks
export const useSession = authClient.useSession;

export const useUser = () => {
  const { data: session } = useSession();
  return session?.user;
};

export const useAuth = () => {
  const { data: session, isPending } = useSession();
  return {
    user: session?.user,
    session: session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  };
};

/**
 * Sign in with phone number and password
 */
export const signInWithPhone = async (phone: string, password: string) => {
  try {
    const response = await authClient.signIn.credential({
      phone,
      password,
    });
    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

/**
 * Sign up with name, phone number, and password
 */
export const signUpWithPhone = async (
  name: string,
  phone: string,
  password: string
) => {
  try {
    const response = await authClient.signUp.credential({
      name,
      phone,
      password,
    });
    return response;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

export type SessionType = typeof Session;
export type UserType = typeof User;
