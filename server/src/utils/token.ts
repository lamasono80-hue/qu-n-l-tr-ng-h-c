import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure random hexadecimal token.
 * Default 32 bytes (64 hex characters).
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
