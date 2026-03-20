import {auth} from "@clerk/nextjs/server";

/**
 * Safe auth check for public pages that gracefully handles Clerk initialization
 * Returns null if auth check fails (user not authenticated or Clerk not ready)
 */
export async function safeAuthCheck() {
  try {
    return await auth();
  } catch (error) {
    // This can happen when:
    // 1. Clerk middleware hasn't initialized yet
    // 2. User is not authenticated
    // 3. There's a temporary auth state mismatch
    console.log("Safe auth check failed, treating as unauthenticated", error);
    return null;
  }
}