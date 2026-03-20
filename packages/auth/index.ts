import { getSessionUser } from "./clerk";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Re-export the session helper for consumers
export { getSessionUser };

// Backward-compatible alias if previously used
export async function getCurrentUser() {
  return await getSessionUser();
}
