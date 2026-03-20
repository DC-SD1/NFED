/**
 * Masks an email address for display, showing only the first and last character
 * of the local part with asterisks in between
 * @param email - The email address to mask
 * @returns The masked email address
 * @example
 * maskEmail("john.doe@example.com") // returns "j***e@example.com"
 * maskEmail("ab@example.com") // returns "a***@example.com"
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain || !localPart) return email; // Not a valid email format

  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.substring(0, 2)}***${localPart.slice(-1)}@${domain}`;
}