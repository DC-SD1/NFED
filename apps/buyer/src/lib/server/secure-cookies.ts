import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync } from "crypto";
import { cookies } from "next/headers";

import { logger } from "@/lib/utils/logger";
import type { CookieOptions } from "@/types/auth";

// Environment-based keys with fallbacks for development
const ENCRYPTION_SECRET = process.env.COOKIE_ENCRYPTION_SECRET || "dev-encryption-secret-min-32-chars";
const SIGNING_SECRET = process.env.COOKIE_SIGNING_SECRET || "dev-signing-secret";

// Derive proper keys from secrets
const ENCRYPTION_KEY = scryptSync(ENCRYPTION_SECRET, "salt", 32); // 32 bytes for AES-256
const IV_LENGTH = 16; // 16 bytes for AES-256-GCM

// Cookie configuration
const SECURE_COOKIE_PREFIX = "__Secure-";
const HOST_COOKIE_PREFIX = "__Host-";

/**
 * Sign a value using HMAC-SHA256
 */
function sign(value: string): string {
  const hmac = createHmac("sha256", SIGNING_SECRET);
  hmac.update(value);
  return `${value}.${hmac.digest("base64url")}`;
}

/**
 * Verify and extract a signed value
 */
function unsign(signedValue: string): string | null {
  const lastDotIndex = signedValue.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return null;
  }

  const value = signedValue.slice(0, lastDotIndex);
  const signature = signedValue.slice(lastDotIndex + 1);

  const hmac = createHmac("sha256", SIGNING_SECRET);
  hmac.update(value);
  const expectedSignature = hmac.digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  let isValid = true;
  for (let i = 0; i < signatureBuffer.length; i++) {
    if (signatureBuffer[i] !== expectedBuffer[i]) {
      isValid = false;
    }
  }

  return isValid ? value : null;
}

/**
 * Encrypt a value using AES-256-GCM
 */
function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted]);
  
  return combined.toString("base64url");
}

/**
 * Decrypt a value encrypted with AES-256-GCM
 */
function decrypt(encryptedText: string): string | null {
  try {
    const combined = Buffer.from(encryptedText, "base64url");
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + 16); // Auth tag is 16 bytes
    const encrypted = combined.subarray(IV_LENGTH + 16);
    
    const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString("utf8");
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
  } = {}
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
    processedValue = encrypt(processedValue);
  }
  
  if (shouldSign) {
    processedValue = sign(processedValue);
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
  } = {}
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
    const unsignedValue = unsign(processedValue);
    if (!unsignedValue) {
      logger.warn("Cookie signature verification failed", { cookieName });
      return null;
    }
    processedValue = unsignedValue;
  }

  if (shouldDecrypt) {
    const decryptedValue = decrypt(processedValue);
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
  } = {}
): Promise<void> {
  const cookieStore = await cookies();
  
  const { useHostPrefix = false } = options;

  // Clear all possible variations of the cookie
  const namesToClear = [
    name,
    `${SECURE_COOKIE_PREFIX}${name}`,
  ];
  
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