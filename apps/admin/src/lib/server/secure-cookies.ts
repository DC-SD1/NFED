import { cookies } from "next/headers";

import { logger } from "@/lib/utils/logger";
import type { CookieOptions } from "@/types/auth";

// Environment-based keys with fallbacks for development
const ENCRYPTION_SECRET =
  process.env.COOKIE_ENCRYPTION_SECRET || "dev-encryption-secret-min-32-chars";
const SIGNING_SECRET =
  process.env.COOKIE_SIGNING_SECRET || "dev-signing-secret";

// Derive proper keys from secrets using Web Crypto API
let ENCRYPTION_KEY: CryptoKey;
let SIGNING_KEY: CryptoKey;

// Initialize keys asynchronously
async function initializeKeys() {
  const encoder = new TextEncoder();

  // Derive encryption key using PBKDF2 (Web Crypto equivalent of scrypt)
  const encryptionKeyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ENCRYPTION_SECRET),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  ENCRYPTION_KEY = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    encryptionKeyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  // Import signing key for HMAC
  SIGNING_KEY = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

// Initialize keys immediately
const keysInitialized = initializeKeys();

const IV_LENGTH = 12; // 12 bytes for AES-GCM (recommended)

// Cookie configuration
const SECURE_COOKIE_PREFIX = "__Secure-";
const HOST_COOKIE_PREFIX = "__Host-";

/**
 * Generate random bytes using Web Crypto API
 */
function randomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

/**
 * Generate random UUID using Web Crypto API
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function randomUUID(): string {
  return crypto.randomUUID();
}

/**
 * Sign a value using HMAC-SHA256 (Web Crypto API)
 */
async function sign(value: string): Promise<string> {
  await keysInitialized;

  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const signature = await crypto.subtle.sign("HMAC", SIGNING_KEY, data);
  const signatureArray = new Uint8Array(signature);

  // Convert to base64url
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${value}.${signatureBase64}`;
}

/**
 * Verify and extract a signed value (Web Crypto API)
 */
async function unsign(signedValue: string): Promise<string | null> {
  await keysInitialized;

  const lastDotIndex = signedValue.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return null;
  }

  const value = signedValue.slice(0, lastDotIndex);
  const signature = signedValue.slice(lastDotIndex + 1);

  try {
    // Convert base64url to ArrayBuffer
    const signatureBase64 = signature
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(signature.length + ((4 - (signature.length % 4)) % 4), "=");

    const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) =>
      c.charCodeAt(0),
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(value);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      SIGNING_KEY,
      signatureBytes,
      data,
    );

    return isValid ? value : null;
  } catch (error) {
    logger.error("Signature verification failed", error);
    return null;
  }
}

/**
 * Encrypt a value using AES-256-GCM (Web Crypto API)
 */
async function encrypt(text: string): Promise<string> {
  await keysInitialized;

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = randomBytes(IV_LENGTH);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    ENCRYPTION_KEY,
    data,
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64url
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decrypt a value encrypted with AES-256-GCM (Web Crypto API)
 */
async function decrypt(encryptedText: string): Promise<string | null> {
  await keysInitialized;

  try {
    // Convert base64url to ArrayBuffer
    const base64 = encryptedText
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(
        encryptedText.length + ((4 - (encryptedText.length % 4)) % 4),
        "=",
      );

    const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      ENCRYPTION_KEY,
      encrypted,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    logger.error("Cookie decryption failed", error);
    return null;
  }
}

/**
 * Set a secure cookie with signing and optional encryption
 */
export async function setSecureCookie(
  name: string,
  value: string,
  options: CookieOptions & {
    encrypt?: boolean;
    sign?: boolean;
    useHostPrefix?: boolean;
  } = {},
): Promise<void> {
  const cookieStore = await cookies();

  const {
    encrypt: shouldEncrypt = false,
    sign: shouldSign = true,
    useHostPrefix = false,
    ...cookieOptions
  } = options;

  // Process the value
  let processedValue = value;

  if (shouldEncrypt) {
    processedValue = await encrypt(processedValue);
  }

  if (shouldSign) {
    processedValue = await sign(processedValue);
  }

  // Determine cookie name prefix
  let cookieName = name;
  if (useHostPrefix && cookieOptions.secure !== false) {
    cookieName = `${HOST_COOKIE_PREFIX}${name}`;
    // __Host- cookies must have Path=/ and no Domain
    cookieOptions.path = "/";
    delete cookieOptions.domain;
  } else if (cookieOptions.secure !== false) {
    cookieName = `${SECURE_COOKIE_PREFIX}${name}`;
  }

  // Set default secure options
  const finalOptions: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    ...cookieOptions,
  };

  // Set domain restriction if provided
  if (process.env.COOKIE_DOMAIN && !useHostPrefix) {
    finalOptions.domain = process.env.COOKIE_DOMAIN;
  }

  cookieStore.set(cookieName, processedValue, finalOptions);
}

/**
 * Get a secure cookie with signature verification and optional decryption
 */
export async function getSecureCookie(
  name: string,
  options: {
    decrypt?: boolean;
    sign?: boolean;
    useHostPrefix?: boolean;
  } = {},
): Promise<string | null> {
  const cookieStore = await cookies();

  const {
    decrypt: shouldDecrypt = false,
    sign: shouldSign = true,
    useHostPrefix = false,
  } = options;

  // Determine cookie name with prefix
  let cookieName = name;
  if (useHostPrefix) {
    cookieName = `${HOST_COOKIE_PREFIX}${name}`;
  } else if (process.env.NODE_ENV === "production") {
    // Try secure prefix first in production
    const secureName = `${SECURE_COOKIE_PREFIX}${name}`;
    const secureCookie = cookieStore.get(secureName);
    if (secureCookie) {
      cookieName = secureName;
    }
  }

  const cookie = cookieStore.get(cookieName);
  if (!cookie?.value) {
    return null;
  }

  let processedValue = cookie.value;

  if (shouldSign) {
    const unsignedValue = await unsign(processedValue);
    if (!unsignedValue) {
      logger.warn("Cookie signature verification failed", { cookieName });
      return null;
    }
    processedValue = unsignedValue;
  }

  if (shouldDecrypt) {
    const decryptedValue = await decrypt(processedValue);
    if (!decryptedValue) {
      logger.warn("Cookie decryption failed", { cookieName });
      return null;
    }
    processedValue = decryptedValue;
  }

  return processedValue;
}

/**
 * Clear a secure cookie
 */
export async function clearSecureCookie(
  name: string,
  options: {
    useHostPrefix?: boolean;
  } = {},
): Promise<void> {
  const cookieStore = await cookies();

  const { useHostPrefix = false } = options;

  // Clear all possible variations of the cookie
  const namesToClear = [name, `${SECURE_COOKIE_PREFIX}${name}`];

  if (useHostPrefix) {
    namesToClear.push(`${HOST_COOKIE_PREFIX}${name}`);
  }

  // Cookie options must match what was used when setting the cookie
  const clearOptions: CookieOptions = {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Add domain if configured (not for __Host- cookies)
  if (process.env.COOKIE_DOMAIN && !useHostPrefix) {
    clearOptions.domain = process.env.COOKIE_DOMAIN;
  }

  for (const cookieName of namesToClear) {
    // For __Host- cookies, don't include domain
    const finalOptions = cookieName.startsWith(HOST_COOKIE_PREFIX)
      ? { ...clearOptions, domain: undefined }
      : clearOptions;

    cookieStore.set(cookieName, "", finalOptions);
  }
}
