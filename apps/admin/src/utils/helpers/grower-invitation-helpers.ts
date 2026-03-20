import { parsePhoneNumber } from "react-phone-number-input";

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
 * @name isValidPhoneNumber
 * @description Validates whether a given string is a valid phone number.
 *
 * @param {string} phoneNumber - The phone number string to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */

export function isValidPhoneNumber(phoneNumber: string): boolean {
  try {
    const phone = parsePhoneNumber(phoneNumber);
    return (phone?.nationalNumber?.length ?? 0) >= 9;
  } catch {
    return false;
  }
}

/**
 * @name emailAlreadyExists
 * @description Checks if the given email already exists more than once in the provided users array.
 * The comparison is case-insensitive.
 *
 * @param {string} email - The email address to check for duplicates.
 * @param growers
 * @returns {boolean} True if the email appears more than once, false otherwise.
 *
 * @example
 * emailAlreadyExists("test@example.com", [
 *   { email: "test@example.com", phoneNumber: "23324567890" },
 *   { email: "user@example.com", role: "23324567890" },
 *   { email: "TEST@example.com", role: "23324567890" }
 * ]); // true
 */
export function emailAlreadyExists(
  email: string,
  growers: { email: string; phoneNumber: string }[],
): boolean {
  return (
    growers.filter(
      (grower) => grower.email.toLowerCase() === email.toLowerCase(),
    ).length > 1
  );
}

/**
 * @name phoneNumberAlreadyExists
 * @description Checks if the given phone number already exists more than once in the provided users array.
 * The comparison is case-insensitive.
 *
 * @param {string} phoneNumber - The phone number to check for duplicates.
 * @param growers
 * @returns {boolean} True if the phone number appears more than once, false otherwise.
 */

export function phoneNumberAlreadyExists(
  phoneNumber: string,
  growers: { email: string; phoneNumber: string }[],
): boolean {
  return (
    growers.filter((grower) => grower.phoneNumber === phoneNumber).length > 1
  );
}

/**
 * @name hasMissingFields
 * @description Checks if any user in the provided array has missing fields (empty email or role).
 *
 * @returns {boolean} True if any user has missing fields, false otherwise.
 *
 * @example
 * hasMissingFields([
 *   { email: "test@example.com", phoneNumber: "234567890" },
 *   { email: "", phoneNumber: "123456789" },
 *   { email: "user@example.com", phoneNumber: "" }
 * ]); // true
 * @param growers
 */
export function hasMissingFields(
  growers: { email: string; phoneNumber: string }[],
): boolean {
  return growers.some(
    (grower) => grower.email.trim() === "" || grower.phoneNumber.trim() === "",
  );
}

/**
 * @name hasDuplicateEmails
 * @description Checks if any user in the provided array has a duplicate email.
 * The comparison is case-insensitive.
 *
 * @returns {boolean} True if any user has a duplicate email, false otherwise.
 *
 * @example
 * hasDuplicateEmails([
 *   { email: "test@example.com", phoneNumber: "234567890" },
 *   { email: "user@example.com", phoneNumber: "123456789" },
 *   { email: "TEST@example.com", phoneNumber: "987654321" }
 * ]); // true
 * @param growers
 */
export function hasDuplicateEmails(
  growers: { email: string; phoneNumber: string }[],
): boolean {
  const normalizedEmails = growers.map((user) =>
    user.email.toLowerCase().trim(),
  );
  const uniqueEmails = new Set(normalizedEmails);
  return normalizedEmails.length !== uniqueEmails.size;
}

/**
 * @name hasDuplicatePhoneNumbers
 * @description Checks if any user in the provided array has a duplicate phone number.
 * The comparison is case-insensitive.
 *
 * @returns {boolean} True if any user has a duplicate phone number, false otherwise.
 * @param growers
 */

export function hasDuplicatePhoneNumbers(
  growers: { email: string; phoneNumber: string }[],
): boolean {
  const normalizedPhoneNumbers = growers.map((user) =>
    user.phoneNumber.toLowerCase().trim(),
  );
  const uniquePhoneNumbers = new Set(normalizedPhoneNumbers);
  return normalizedPhoneNumbers.length !== uniquePhoneNumbers.size;
}

/**
 * @name hasInvalidEmails
 * @description Checks if any user in the provided array has an invalid email.
 *
 * @returns {boolean} True if any user has an invalid email, false otherwise.
 * @param growers
 */
export function hasInvalidEmails(
  growers: { email: string; phoneNumber: string }[],
): boolean {
  return growers.some((grower) => !isValidEmail(grower.email));
}

/**
 * @name hasInvalidPhoneNumbers
 * @description Checks if any user in the provided array has an invalid phone number.
 *
 * @returns {boolean} True if any user has an invalid phone number, false otherwise.
 * @param growers
 */

export function hasInvalidPhoneNumbers(
  growers: { email: string; phoneNumber: string }[],
): boolean {
  return growers.some((grower) => !isValidPhoneNumber(grower.phoneNumber));
}
