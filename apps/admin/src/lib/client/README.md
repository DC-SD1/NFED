# Zustand Cookie Storage Adapter

This directory contains the cookie storage adapter for Zustand, enabling client-side state persistence using cookies instead of localStorage.

## Features

- **SSR Compatible**: Works with Next.js server-side rendering
- **Secure by Default**: Automatically sets secure cookie attributes
- **TypeScript Support**: Fully typed for better developer experience
- **No External Dependencies**: Uses native browser APIs (can optionally use js-cookie)

## Usage

### Basic Setup

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cookieStorage } from "@/lib/client/zustand-cookie-storage";

const useStore = create(
  persist(
    (set) => ({
      // Your store state and actions
    }),
    {
      name: "my-store",
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
```

### Auth Store Example

```typescript
import { cookieStorage } from "@/lib/client/zustand-cookie-storage";

const useAuthStore = create(
  persist(
    (set) => ({
      userId: null,
      email: null,
      roles: null,
      setUser: (user) => set(user),
      clearUser: () => set({ userId: null, email: null, roles: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        roles: state.roles,
      }),
    }
  )
);
```

## Important Notes

1. **Security**: This adapter only handles regular cookies that JavaScript can access. HTTP-only cookies (like auth tokens) must be managed server-side.

2. **Cookie Limits**: Browsers have limits on cookie size (typically 4KB per cookie). Store only essential data.

3. **SSR Hydration**: For SSR apps, ensure proper hydration by reading initial state from cookies on the server and passing it to the client.

## Cookie Options

The adapter sets the following default cookie options:
- `expires`: 7 days
- `path`: "/"
- `secure`: true (in production)
- `sameSite`: "strict"

## Migration from localStorage

To migrate existing stores from localStorage to cookies:

1. Create a migration function in your store
2. Read from localStorage on first load
3. Write to cookies and clear localStorage
4. Update the storage configuration

Example migration:

```typescript
const migrateFromLocalStorage = () => {
  if (typeof window === "undefined") return;
  
  const oldData = localStorage.getItem("auth-storage");
  if (oldData) {
    try {
      const parsed = JSON.parse(oldData);
      // Write to cookies using the new storage
      cookieStorage.setItem("auth-storage", JSON.stringify(parsed.state));
      // Clear old localStorage
      localStorage.removeItem("auth-storage");
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }
};
```