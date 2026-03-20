// Clerk global type declaration
interface Window {
  Clerk?: {
    signOut: () => Promise<void>;
    // Add other Clerk methods as needed
  };
}