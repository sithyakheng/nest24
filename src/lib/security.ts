/**
 * Security utilities for NestKH marketplace
 */

/**
 * Sanitizes user input by trimming and stripping potentially dangerous characters.
 * Prevents basic XSS and SQL injection (though Supabase client handles SQLi).
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .trim()
    // Remove HTML tags to prevent XSS
    .replace(/<[^>]*>?/gm, '')
    // Escape single quotes for safety (though Supabase parameterizes, this is extra precaution)
    .replace(/'/g, "''")
    // Limit length to prevent buffer overflow/DoS-style long strings if necessary
    // .substring(0, 1000)
}

export const isSafeRedirect = (url: string) => {
  return url.startsWith('/') && !url.startsWith('//')
}

/**
 * Validates if a file type is allowed for image uploads
 */
export function isValidImageType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  return allowedTypes.includes(mimeType);
}

/**
 * Validates file signature (magic bytes) to ensure the file is a real image
 */
export function validateFileSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  
  // WEBP: 52 49 46 46 (RIFF)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    // Check if it's WEBP (bytes 8-11 should be WEBP)
    const type = buffer.toString('ascii', 8, 12);
    return type === 'WEBP';
  }

  return false;
}

export function filterFirewallContent(content: string): string {
  if (!content) return ''

  let filtered = content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '[LINK BLOCKED]')

  const patterns = [
    /https?:\/\/[^\s"']*?(?:bit\.ly|tinyurl\.com)[^\s"']*/gi,
    /https?:\/\/[^\s"']*?\.(?:xyz|top|club|online|site|pw|click|info|loan|review|bid|win|party|live|racing|stream|trade)[^\s"']*/gi,
    /https?:\/\/(?![^\s"']*?(?:nestkh\.com|google\.com|youtube\.com|facebook\.com|instagram\.com|telegram\.me|tiktok\.com|twitter\.com|linkedin\.com))[^\s"']+/gi
  ]

  patterns.forEach((pattern) => {
    filtered = filtered.replace(pattern, '[LINK BLOCKED]')
  })

  return filtered
}

/**
 * Basic email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
