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

export function formatPhoneToE164(
  phoneNumber: string | null | undefined,
): string {
  if (!phoneNumber || phoneNumber === "0") return "";

  // If already starts with +, return as is
  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  // Add + prefix for E.164 format
  return `+${phoneNumber}`;
}

// Function to filter input to only allow letters, numbers, and dashes
export const handlePostCodeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  const value = input.value;
  const filteredValue = value.replace(/[^a-zA-Z0-9-]/g, "");

  if (value !== filteredValue) {
    input.value = filteredValue;
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  }
};

export const getFileNameFromUrl = (fileUrl: string): string => {
  if (!fileUrl) return "";

  const parts = fileUrl.split("/");
  const filename = parts[parts.length - 1] || "";

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}

export function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
