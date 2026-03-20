# Zustand State Management Best Practices Guide

## Table of Contents
1. [What is Zustand?](#what-is-zustand)
2. [Why Choose Zustand?](#why-choose-zustand)
3. [Key Benefits](#key-benefits)
4. [When to Use Zustand](#when-to-use-zustand)
5. [Best Practices](#best-practices)
6. [Performance Optimization](#performance-optimization)
7. [TypeScript Integration](#typescript-integration)
8. [Cross-Platform Support](#cross-platform-support)
9. [Common Patterns](#common-patterns)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
11. [Testing Strategies](#testing-strategies)
12. [Real-World Examples from Our Codebase](#real-world-examples)
13. [Community Middleware](#community-middleware)

## What is Zustand?

Zustand (German for "state") is a lightweight, fast, and scalable state management solution for React applications. It provides a simple API based on hooks while being unopinionated about how you structure your application state.

```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
```

## Why Choose Zustand?

### 1. **Minimal Boilerplate**
Unlike Redux, Zustand requires no actions, reducers, or dispatchers. State updates are straightforward function calls.

### 2. **TypeScript First**
Excellent TypeScript support with minimal configuration needed.

### 3. **Framework Agnostic Core**
The core is vanilla JavaScript, making it portable across different environments.

### 4. **No Providers Required**
Unlike Context API, Zustand doesn't require wrapping your app in providers.

### 5. **Small Bundle Size**
Only ~2.9KB gzipped, making it one of the smallest state management libraries.

## Key Benefits

### Cross-Platform Compatibility
- **React Native**: Works out-of-the-box with React Native
- **Next.js**: Full SSR/SSG support with proper hydration handling
- **Electron/Tauri**: Can be used in desktop applications
- **Web Workers**: Store can be accessed outside React components

### Developer Experience
- Simple, intuitive API
- Excellent DevTools integration
- Time-travel debugging with Redux DevTools
- Hot module replacement support
- Minimal learning curve

### Performance
- Automatic render optimization through selectors
- No unnecessary re-renders
- Efficient shallow comparison utilities
- Computed values without redundant calculations

## When to Use Zustand

### Use Zustand When:
- You need global state management without boilerplate
- Performance is critical (frequent state updates)
- You want flexibility in architecture
- Building small to large applications
- Need state persistence across sessions
- Working with React Native or cross-platform apps
- Team prefers simplicity over strict patterns

### Consider Alternatives When:
- Your team requires strict architectural patterns (Redux)
- You need powerful time-travel debugging (Redux DevTools)
- Working with existing Redux ecosystem
- Simple prop drilling would suffice
- State updates are infrequent (Context API might be enough)

## Best Practices

### 1. Store Organization

**✅ DO: Create Multiple Domain-Specific Stores**
```typescript
// Separate stores by domain
const useAuthStore = create<AuthStore>(...);
const useCartStore = create<CartStore>(...);
const useSettingsStore = create<SettingsStore>(...);
```

**❌ DON'T: Create One Monolithic Store**
```typescript
// Avoid this
const useAppStore = create({
  // auth state
  user: null,
  token: null,
  // cart state
  items: [],
  total: 0,
  // settings state
  theme: 'light',
  // ... everything else
});
```

### 2. TypeScript Patterns

**Best Practice: Separate State and Actions Interfaces**
```typescript
interface BearState {
  bears: number;
}

interface BearActions {
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (by: number) => void;
}

type BearStore = BearState & BearActions;

export const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (by) => set((state) => ({ bears: state.bears + by })),
}));
```

### 3. Action Naming Conventions

Use clear, descriptive action names that indicate what they do:
```typescript
// Good
setUser, updateProfile, clearCart, toggleTheme

// Avoid
set, update, change, handle
```

## Performance Optimization

### 1. Use Selectors for Fine-Grained Subscriptions

**❌ Subscribing to Entire Store (Causes Unnecessary Re-renders)**
```javascript
function Component() {
  const store = useStore(); // Re-renders on ANY state change
  return <div>{store.bears}</div>;
}
```

**✅ Using Selectors (Optimal Performance)**
```javascript
function Component() {
  const bears = useStore((state) => state.bears); // Only re-renders when bears change
  return <div>{bears}</div>;
}
```

### 2. Shallow Comparison for Multiple Values

**Using the `shallow` utility:**
```javascript
import { shallow } from 'zustand/shallow';

function Component() {
  const { bears, honey } = useStore(
    (state) => ({ bears: state.bears, honey: state.honey }),
    shallow
  );
}
```

**Using the modern `useShallow` hook:**
```javascript
import { useShallow } from 'zustand/react/shallow';

function Component() {
  const { bears, honey } = useStore(
    useShallow((state) => ({ bears: state.bears, honey: state.honey }))
  );
}
```

### 3. Memoize Complex Selectors

```javascript
import { useCallback } from 'react';

function ExpensiveComponent() {
  const selectExpensiveData = useCallback(
    (state) => ({
      items: state.items,
      total: state.items.reduce((sum, item) => sum + item.price, 0),
      averagePrice: state.items.reduce((sum, item) => sum + item.price, 0) / state.items.length,
    }),
    []
  );
  
  const data = useStore(selectExpensiveData, shallow);
}
```

### 4. Avoid Redundant State

**❌ Storing Computed Values**
```javascript
const useStore = create((set, get) => ({
  price: 10,
  quantity: 2,
  total: 20, // Redundant - can be computed
  updateQuantity: (qty) => set({ 
    quantity: qty, 
    total: get().price * qty // Have to remember to update
  }),
}));
```

**✅ Computing Values On-Demand**
```javascript
const useStore = create((set, get) => ({
  price: 10,
  quantity: 2,
  getTotal: () => get().price * get().quantity, // Computed when needed
  updateQuantity: (qty) => set({ quantity: qty }),
}));
```

## TypeScript Integration

### Complete TypeScript Setup

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define your state shape
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Define your actions
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Combine into store type
type AuthStore = AuthState & AuthActions;

// Create the store with full type safety
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        
        // Actions
        login: async (credentials) => {
          const response = await api.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        },
        
        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },
        
        updateUser: (updates) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...updates },
            });
          }
        },
      }),
      {
        name: 'auth-storage',
      }
    )
  )
);
```

## Cross-Platform Support

### React Native Setup

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      bears: 0,
      addBear: () => set((state) => ({ bears: state.bears + 1 })),
    }),
    {
      name: 'bear-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### For Better Performance with MMKV

```javascript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const zustandStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

const useStore = create(
  persist(
    (set) => ({
      // your store
    }),
    {
      name: 'app-storage',
      storage: zustandStorage,
    }
  )
);
```

## Common Patterns

### 1. Actions Outside React Components

```javascript
// Can be called from anywhere
const { login, logout } = useAuthStore.getState();

// In an API interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### 2. Subscribing to Store Changes

```javascript
// Subscribe to specific state changes
const unsubscribe = useStore.subscribe(
  (state) => state.bears,
  (bears) => {
    console.log('Bears changed to:', bears);
  }
);

// Clean up
unsubscribe();
```

### 3. Middleware Composition

```javascript
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

const useStore = create()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        bears: 0,
        addBear: () => set((state) => ({ bears: state.bears + 1 })),
      })),
      {
        name: 'bear-storage',
      }
    )
  )
);
```

## Anti-Patterns to Avoid

### 1. ❌ Mutating State Directly

```javascript
// WRONG - This won't trigger re-renders
const useStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    state.items.push(item); // Mutation!
    return state;
  }),
}));

// CORRECT - Create new objects/arrays
const useStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
}));
```

### 2. ❌ Storing Non-Serializable Data

```javascript
// WRONG
const useStore = create((set) => ({
  user: {
    name: 'John',
    logout: () => console.log('logout'), // Functions in state
  },
  promise: fetch('/api/data'), // Promises in state
}));

// CORRECT - Keep only serializable data
const useStore = create((set) => ({
  user: {
    name: 'John',
  },
  logout: () => {
    console.log('logout');
    set({ user: null });
  },
}));
```

### 3. ❌ Using getState() in Components

```javascript
// WRONG - Not reactive, won't cause re-renders
function Component() {
  const bears = useStore.getState().bears;
  return <div>{bears}</div>;
}

// CORRECT - Use the hook with selector
function Component() {
  const bears = useStore((state) => state.bears);
  return <div>{bears}</div>;
}
```

## Testing Strategies

### Unit Testing Store Logic

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useStore } from './store';

describe('Store', () => {
  // Reset store before each test
  beforeEach(() => {
    useStore.setState({ bears: 0 });
  });

  it('should increment bears', () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.increasePopulation();
    });
    
    expect(result.current.bears).toBe(1);
  });
  
  it('should set bears to specific value', () => {
    // Direct state manipulation for testing
    act(() => {
      useStore.setState({ bears: 10 });
    });
    
    expect(useStore.getState().bears).toBe(10);
  });
});
```

### Integration Testing with Components

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { useStore } from './store';
import { BearCounter } from './BearCounter';

describe('BearCounter', () => {
  beforeEach(() => {
    useStore.setState({ bears: 0 });
  });

  it('should display and update bear count', () => {
    render(<BearCounter />);
    
    expect(screen.getByText('Bears: 0')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Add Bear'));
    
    expect(screen.getByText('Bears: 1')).toBeInTheDocument();
  });
});
```

## Real-World Examples from Our Codebase

### 1. Authentication Store with SSR Support

From `apps/grower/src/lib/stores/auth-store-ssr.tsx`:

```typescript
// Advanced pattern for SSR-safe auth store with cookie persistence
export const createAuthStore = (initState?: Partial<AuthState>) => {
  return createStore<AuthStoreState>()(
    persist(
      (set, get) => ({
        // Initial State
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        userId: null,
        email: null,
        roles: null,
        isOperationInProgress: false,
        ...initState,
        
        // Actions with proper error handling
        actions: {
          exchangeTokens: async (clerkToken: string) => {
            // Check if we already have valid tokens
            if (areTokensValid(get())) {
              return { success: true, reason: "tokens_already_valid" };
            }
            
            // Use operation lock to prevent concurrent exchanges
            const result = await withOperationLock(
              async () => {
                const exchangeResult = await tokenExchangeService.exchange(clerkToken);
                if (exchangeResult.success && exchangeResult.data) {
                  set({
                    expiresAt: exchangeResult.data.expiresAt,
                    userId: exchangeResult.data.userId,
                    email: exchangeResult.data.email,
                    roles: exchangeResult.data.roles,
                  });
                }
                return exchangeResult;
              },
              get,
              set,
              "Token exchange"
            );
            return result || { success: false, reason: "operation_in_progress" };
          },
          
          logout: async (signOutFn, router, locale = "en") => {
            // Clear local state first
            get().actions.clearStore();
            
            // Best effort API logout
            await authApiService.logout();
            
            // Clerk sign out
            await signOutFn();
            
            // Redirect
            router.replace(getSignInUrl(locale));
          },
          
          clearStore: () => {
            set({
              accessToken: null,
              refreshToken: null,
              expiresAt: null,
              userId: null,
              email: null,
              roles: null,
              isOperationInProgress: false,
            });
          },
        },
      }),
      {
        name: AUTH_CONFIG.storage.name,
        storage: createJSONStorage(() =>
          typeof window !== "undefined" ? cookieStorage : createNoopStorage()
        ),
        skipHydration: true, // Critical for SSR
        partialize: (state) => {
          // Only persist non-sensitive metadata
          const persistFields: Partial<AuthState> = {};
          AUTH_CONFIG.storage.persistFields.forEach((field) => {
            persistFields[field] = state[field];
          });
          return persistFields;
        },
      }
    )
  );
};
```

### 2. Simple Modal Store Pattern

From `apps/grower/src/lib/stores/use-modal.ts`:

```typescript
interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ type, isOpen: true, data }),
  onClose: () => set({ type: null, isOpen: false, data: {} }),
}));
```

### 3. File Upload Store with Progress Tracking

From `apps/grower/src/lib/stores/upload-store.tsx`:

```typescript
interface UploadStore {
  file: UploadedFile | null;
  uploadResponse: UploadResponse | null;
  setFile: (file: UploadedFile | null) => void;
  setUploadResponse: (response: UploadResponse | null) => void;
  updateFileProgress: (progress: number) => void;
  updateFileStatus: (status: UploadedFile["status"], errorMessage?: string) => void;
  resetUpload: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  file: null,
  uploadResponse: null,
  setFile: (file) => set({ file }),
  setUploadResponse: (response) => set({ uploadResponse: response }),
  updateFileProgress: (progress) =>
    set((state) => ({
      file: state.file ? { ...state.file, progress } : null,
    })),
  updateFileStatus: (status, errorMessage) =>
    set((state) => ({
      file: state.file ? { ...state.file, status, errorMessage } : null,
    })),
  resetUpload: () => set({ file: null, uploadResponse: null }),
}));
```

### 4. Custom Cookie Storage Implementation

From `apps/grower/src/lib/client/zustand-cookie-storage.ts`:

```typescript
// Cookie storage adapter for Zustand with SSR support
export const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") {
        return null; // SSR safety
      }
      const value = CookieUtils.get(name);
      return value || null;
    } catch (error) {
      logger.error("Error reading cookie from Zustand storage:", { error });
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") {
        return; // SSR safety
      }
      CookieUtils.set(name, value, {
        expires: 7, // 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    } catch (error) {
      logger.error("Error writing cookie to Zustand storage:", { error });
    }
  },
  
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") {
        return; // SSR safety
      }
      CookieUtils.remove(name, { path: "/" });
    } catch (error) {
      logger.error("Error removing cookie from Zustand storage:", { error });
    }
  },
};
```

## Community Middleware

The Zustand ecosystem includes many community-created middleware packages:

### State Synchronization
- **zustand-sync-tabs**: Sync state between browser tabs/windows
- **use-broadcast-ts**: Share state between tabs using BroadcastChannel API
- **zustand-pub**: Cross-framework state sharing (React/Vue)

### Enhanced DevTools
- **zukeeper**: Native DevTools with time-travel debugging
- **zundo**: Undo/redo functionality for your stores

### Persistence Options
- **zustand-persist**: Enhanced persistence middleware
- **zustand-hash-storage**: Save state in URL hash
- **zustand-interval-persist**: Auto-save at regular intervals

### Computed State
- **zustand-computed**: Add computed values to your stores
- **zustand-middleware-computed-state**: Simple computed state middleware

### Form Management
- **zustand-forms**: Type-safe form state management

### Integration with Other Libraries
- **zustand-middleware-xstate**: Use XState machines with Zustand
- **zustand-middleware-yjs**: Sync with Yjs for collaborative features
- **zustand-rx**: RxJS Observable integration

## Summary

Zustand provides an excellent balance of simplicity and power for React state management. By following these best practices, you can build performant, maintainable applications that scale well. The key principles to remember:

1. **Use selectors** for performance optimization
2. **Split stores by domain** for better organization  
3. **Leverage TypeScript** for type safety
4. **Avoid mutations** and non-serializable data
5. **Test thoroughly** using the patterns shown
6. **Consider middleware** for advanced features

Our codebase demonstrates these patterns effectively, from complex auth stores with SSR support to simple UI state management. Zustand's flexibility allows it to handle both cases elegantly while maintaining excellent developer experience and performance.