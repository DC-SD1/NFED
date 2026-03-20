/**
 * Clerk type augmentations for custom metadata
 * This file extends Clerk's built-in types to include our custom public metadata structure
 */

// Define our custom metadata structure
export interface CustomPublicMetadata {
  roles?: "Admin"[];
}

// Augment Clerk's global types
declare global {
  // Augment UserPublicMetadata from @clerk/types
  type UserPublicMetadata = CustomPublicMetadata;

  // Augment session claims for auth() and useAuth()
  interface CustomJwtSessionClaims {
    publicMetadata?: CustomPublicMetadata;
  }
}

// Export empty object to make this a module
export {};
