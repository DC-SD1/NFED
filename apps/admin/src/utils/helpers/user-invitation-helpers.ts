/**
 * @name isValidEmail
 * @description Validates whether a given string is a properly formatted email address.
 * Uses a simplified but robust RFC 5322-compliant regex.
 *
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 *
 * @example
 * isValidEmail("test@example.com"); // true
 * isValidEmail("invalid@com"); // false
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // RFC 5322 compliant regex (simplified but robust)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
}

/**
 * @name emailAlreadyExists
 * @description Checks if the given email already exists more than once in the provided users array.
 * The comparison is case-insensitive.
 *
 * @param {string} email - The email address to check for duplicates.
 * @param {{ email: string; role: string }[]} users - The array of user objects to search within.
 * @returns {boolean} True if the email appears more than once, false otherwise.
 *
 * @example
 * emailAlreadyExists("test@example.com", [
 *   { email: "test@example.com", role: "admin" },
 *   { email: "user@example.com", role: "user" },
 *   { email: "TEST@example.com", role: "editor" }
 * ]); // true
 */
export function emailAlreadyExists(
  email: string,
  users: { email: string; role: string }[],
): boolean {
  return (
    users.filter((user) => user.email.toLowerCase() === email.toLowerCase())
      .length > 1
  );
}

/**
 * @name hasMissingFields
 * @description Checks if any user in the provided array has missing fields (empty email or role).
 *
 * @param {{ email: string; role: string }[]} users - The array of user objects to check.
 * @returns {boolean} True if any user has missing fields, false otherwise.
 *
 * @example
 * hasMissingFields([
 *   { email: "test@example.com", role: "admin" },
 *   { email: "", role: "user" },
 *   { email: "user@example.com", role: "" }
 * ]); // true
 */
export function hasMissingFields(
  users: { email: string; role: string }[],
): boolean {
  return users.some(
    (user) => user.email.trim() === "" || user.role.trim() === "",
  );
}

/**
 * @name hasDuplicateEmails
 * @description Checks if any user in the provided array has a duplicate email.
 * The comparison is case-insensitive.
 *
 * @param {{ email: string; role: string }[]} users - The array of user objects to check.
 * @returns {boolean} True if any user has a duplicate email, false otherwise.
 *
 * @example
 * hasDuplicateEmails([
 *   { email: "test@example.com", role: "admin" },
 *   { email: "user@example.com", role: "user" },
 *   { email: "TEST@example.com", role: "editor" }
 * ]); // true
 */
export function hasDuplicateEmails(
  users: { email: string; role: string }[],
): boolean {
  const normalizedEmails = users.map((user) => user.email.toLowerCase().trim());
  const uniqueEmails = new Set(normalizedEmails);
  return normalizedEmails.length !== uniqueEmails.size;
}

/**
 * @name hasInvalidEmails
 * @description Checks if any user in the provided array has an invalid email.
 *
 * @param {{ email: string; role: string }[]} users - The array of user objects to check.
 * @returns {boolean} True if any user has an invalid email, false otherwise.
 */
export function hasInvalidEmails(
  users: { email: string; role: string }[],
): boolean {
  return users.some(
    (user) => !isValidEmail(user.email) || !isCompleteFarmerEmail(user.email),
  );
}

/**
 * @name isCompleteFarmerEmail
 * @description Checks if the given email is a complete farmer email.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email is a complete farmer email, false otherwise.
 */
export function isCompleteFarmerEmail(email: string): boolean {
  return email.includes("@completefarmer.com");
}
