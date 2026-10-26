import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string | number;
}

/**
 * Validates and normalizes JWT expiresIn configuration.
 * Accepts numeric string (seconds) or human-readable format (e.g., '86400s', '1d', '24h').
 */
export function validateAndParseJwtExpiresIn(rawVal?: string): string | number {
  if (!rawVal) {
    return 86400; // Default 24 hours in seconds (numeric)
  }

  const trimmed = rawVal.trim();

  // If pure numeric string, validate and return positive integer (seconds)
  if (/^\d+$/.test(trimmed)) {
    const parsed = parseInt(trimmed, 10);
    if (parsed <= 0 || isNaN(parsed)) {
      throw new Error(`Invalid JWT_EXPIRES_IN value '${rawVal}': must be a positive integer`);
    }
    return parsed;
  }

  // If string format with valid time unit suffix (e.g. 86400s, 60m, 24h, 7d)
  const unitMatch = /^(\d+)([smhdwy])$/i.exec(trimmed);
  if (!unitMatch) {
    throw new Error(
      `Invalid JWT_EXPIRES_IN format '${rawVal}'. Expected number or suffix s/m/h/d (e.g. '86400', '86400s', '24h', '7d')`,
    );
  }

  const amount = parseInt(unitMatch[1], 10);
  if (amount <= 0) {
    throw new Error(`Invalid JWT_EXPIRES_IN amount '${amount}': must be greater than zero`);
  }

  return trimmed;
}

export const jwtConfig = registerAs('jwt', (): JwtConfig => ({
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-backendcore-system-2026',
  expiresIn: validateAndParseJwtExpiresIn(process.env.JWT_EXPIRES_IN),
}));
