"use node";

import { hash, verify } from "@node-rs/argon2";

/**
 * Hash a password using Argon2id algorithm
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify a password against a hash
 * @param hash - The stored password hash
 * @param password - Plain text password to verify
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await verify(hash, password);
  } catch (error) {
    // If hash is invalid format, return false instead of throwing
    return false;
  }
}

/**
 * Normalize phone number to E.164 format
 * Supports Kenyan phone numbers (254) by default
 * @param phone - Phone number in various formats
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Kenyan numbers
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    // Convert 0712345678 to 254712345678
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("254") && cleaned.length === 12) {
    // Already in correct format
    return cleaned;
  } else if (cleaned.startsWith("7") && cleaned.length === 9) {
    // Convert 712345678 to 254712345678
    cleaned = "254" + cleaned;
  }

  // Add more country codes here if needed
  // For now, assume it's a Kenyan number if no country code

  return cleaned;
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns True if valid format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  
  // Check if it's a valid Kenyan number (12 digits starting with 254)
  if (/^254[17]\d{8}$/.test(normalized)) {
    return true;
  }

  // Add more validation rules for other countries if needed
  
  return false;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (password.length > 128) {
    return "Password must not exceed 128 characters";
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   return "Password must contain at least one uppercase letter";
  // }

  // if (!/[a-z]/.test(password)) {
  //   return "Password must contain at least one lowercase letter";
  // }

  // if (!/[0-9]/.test(password)) {
  //   return "Password must contain at least one number";
  // }

  return null;
}
