import crypto from 'crypto'

/**
 * Hash a PIN using SHA256 for secure storage
 * @param pin - The plain 6-digit PIN string
 * @returns Hashed PIN string
 */
export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex')
}

/**
 * Verify a PIN against its hash
 * @param pin - Plain PIN to verify
 * @param hash - Stored hash to compare against
 * @returns true if PIN matches hash, false otherwise
 */
export function verifyPin(pin: string, hash: string): boolean {
  const pinHash = hashPin(pin)
  return pinHash === hash
}
