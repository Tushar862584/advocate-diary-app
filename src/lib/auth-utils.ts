'use server';

// This file is server-only and will not be included in client bundles
import * as bcrypt from 'bcrypt';

/**
 * Verifies a password against a hash
 * @param plainPassword The plaintext password to verify
 * @param hashedPassword The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hashes a password
 * @param password The plaintext password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
} 