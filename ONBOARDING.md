# CF Platform - Developer Onboarding Guide

Welcome to the CF (CrowdFarming) Platform! This guide focuses on the project-specific architecture, patterns, and workflows you'll need to be productive immediately.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Projects](#understanding-the-projects)
3. [Shared Packages](#shared-packages)
4. [Making API Requests](#making-api-requests)
5. [Authentication & User Management](#authentication--user-management)
6. [Using UI Components](#using-ui-components)
7. [Theming & Styling System](#theming--styling-system)
8. [State Management](#state-management)
9. [Common Workflows](#common-workflows)

---

## Quick Start

### Prerequisites

- **Bun** v1.1.10+
- **Node.js** v18+
- **Git**

### Setup

```bash
# Clone and install
git clone <repository-url>
cd cf-monorepo
bun install

# Setup environment variables
cp apps/grower/.env.example apps/grower/.env.local
cp apps/buyer/.env.example apps/buyer/.env.local

# Start development
bun run dev:grower    # Port 3000
bun run dev:buyer     # Port 3010
```

### Essential Commands

```bash
# Development
bun run dev              # Start all apps
bun run dev:grower       # Start grower app only
bun run dev:buyer        # Start buyer app only

# Quality checks
bun run typecheck        # TypeScript validation
bun run lint             # ESLint check
bun run test             # Run unit tests

# Testing
bun run test:e2e         # E2E tests with Playwright
bun run test:coverage    # Coverage report

# Dependency management
bun run deps:check       # Check version consistency
bun run deps:fix         # Fix version mismatches
```

---

## Understanding the Projects

The monorepo contains three main applications and several shared packages.

### Apps

#### 1. **Grower App** (`apps/grower/`)

The primary application for farmers to manage their farms, crops, and production plans.

**Port**: 3000

**Key Features**:

- Farm land management
- Production planning
- Crop selection and tracking
- Order management
- Account settings

**Structure**:

```
apps/grower/src/
├── app/[locale]/              # Next.js App Router
│   ├── (auth)/               # Authentication pages
│   ├── (dashboard)/          # Dashboard pages (farm-owner, etc.)
│   ├── onboarding/           # User onboarding flow
│   └── unauthorized/         # Access denied page
├── components/               # React components
│   ├── forms/               # Form components
│   ├── onboarding/          # Onboarding-specific components
│   └── ...
├── lib/
│   ├── api/                 # API client setup
│   │   ├── client.ts       # Client-side API
│   │   └── server.ts       # Server-side API
│   ├── stores/              # Zustand stores
│   ├── services/            # Business logic services
│   └── utils/               # Utility functions
├── config/                  # App configuration
│   ├── navigation.ts       # Navigation structure
│   └── providers.tsx       # Global providers
└── types/                   # TypeScript types
```

#### 2. **Buyer App** (`apps/buyer/`)

Platform for buyers to browse and purchase crops from farmers.

**Port**: 3010

**Structure**: Similar to Grower app with buyer-specific features

- Browse available crops
- Place orders
- Track deliveries
- Manage buyer profile

#### 3. **Admin App** (`apps/admin/`)

Administrative dashboard for platform management.

**Key Features**:

- User management
- Platform analytics
- Content moderation
- System configuration

---

## Shared Packages

All packages are scoped under `@cf/` and located in `packages/`.

### 1. **@cf/api** - API Client

Type-safe API client generated from OpenAPI specifications.

**Location**: `packages/api/`

**Key Files**:

- `src/client.ts` - API client factory with auth interceptors
- `src/generated/types.ts` - Auto-generated TypeScript types
- `src/index.ts` - Public exports

**Features**:

- Automatic JWT token injection
- Token refresh handling
- Request/response interceptors
- Type-safe endpoints using openapi-fetch
- React Query integration via openapi-react-query

**Regenerating Types**:

```bash
cd packages/api
bun run generate
```

### 2. **@cf/ui** - Shared UI Components

Component library based on shadcn/ui with Tailwind CSS.

**Location**: `packages/ui/`

**Available Components**:

```typescript
// Import any component
import {
  Button,
  Card,
  Input,
  Dialog,
  Select,
  Badge,
  Toast,
  // ... 50+ components
} from "@cf/ui";

// Utility function
import { cn } from "@cf/ui";
```

**Component Categories**:

- **Forms**: Input, Select, Checkbox, Textarea, controlled variants
- **Layout**: Card, Separator, Sheet, Drawer
- **Navigation**: Tabs, Breadcrumb, BottomNavigation
- **Feedback**: Toast, Alert, Dialog, Progress
- **Data Display**: Table, Badge, Avatar, Skeleton

**Styling**: All components use Tailwind CSS and support className prop for customization.

### 3. **@cf/common** - Shared Hooks & Utils

Common utilities and React hooks shared across apps.

**Location**: `packages/common/`

**Key Exports**:

**Hooks** (`@cf/common/hooks`):

- `useInitializedEffect` - Effect that only runs when all dependencies are defined
- `useInitializedEffectOnce` - Initialized effect that runs only once
- `useAsyncEffect` - Async version of useEffect

**Config**:

- `siteConfig` - Site configuration

**Real Usage Example** (`apps/grower/src/app/[locale]/(dashboard)/farm-owner/farm-lands/details/[id]/page.tsx`):

```typescript
"use client";

import {
  useInitializedEffect,
  useInitializedEffectOnce,
} from "@cf/common/hooks";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function FarmLandDetailsPage() {
  const params = useParams();
  const farmId = params.id as string;
  const [farmData, setFarmData] = useState(null);

  // Only runs when farmId is defined (not undefined)
  useInitializedEffect(() => {
    console.log("Farm ID is now available:", farmId);
    // Fetch farm data
  }, [farmId]);

  // Runs only once when farmId becomes available
  useInitializedEffectOnce(() => {
    console.log("One-time initialization with farmId:", farmId);
    // Initialize map or analytics
  }, [farmId]);

  return <div>Farm Details</div>;
}
```

**Why `useInitializedEffect`?**

In Next.js with dynamic routes, params can be `undefined` during initial render. This hook ensures your effect only runs when all dependencies have actual values:

```typescript
// ❌ Problem: Effect runs with undefined params
useEffect(() => {
  fetchFarm(farmId); // farmId might be undefined!
}, [farmId]);

// ✅ Solution: Effect only runs when farmId is defined
useInitializedEffect(() => {
  fetchFarm(farmId); // farmId is guaranteed to be defined
}, [farmId]);
```

### 4. **@cf/logger** - Centralized Logging

Pino-based logger for consistent logging across applications with structured logging support.

**Location**: `packages/logger/`

**Key Features**:

- Structured logging with metadata
- Child loggers for module-specific logging
- Browser and Node.js support
- Better Stack (Logtail) integration
- Log levels: debug, info, warn, error, fatal

**Setup in Apps** (`apps/grower/src/lib/logger.ts`):

```typescript
import { getLogger } from "@cf/logger/node";

// Create a logger instance for the grower app
export const logger = getLogger("grower");

// Export specific loggers for different modules
export const apiLogger = logger.child({ module: "api" });
export const authLogger = logger.child({ module: "auth" });
export const dbLogger = logger.child({ module: "db" });
```

**Real Usage Examples**:

**Example 1: Auth Store Logging** (`apps/grower/src/lib/stores/auth-store-ssr.tsx`):

```typescript
import { logger } from "@/lib/utils/logger";

export const createAuthStore = () => {
  return createStore((set, get) => ({
    actions: {
      exchangeTokens: async (clerkToken: string) => {
        logger.info("Exchanging Clerk token for internal JWT");

        try {
          const result = await tokenExchangeService.exchange(clerkToken);

          if (result.success) {
            logger.info("Token exchange successful", {
              userId: result.data.userId,
            });
            set({ userId: result.data.userId });
          } else {
            logger.warn("Token exchange failed", {
              reason: result.reason,
            });
          }
        } catch (error) {
          logger.error("Token exchange error", error);
        }
      },

      logout: async (signOutFn, router, locale) => {
        logger.info("User logout initiated");

        try {
          await authApiService.logout();
          logger.info("Logout successful");
        } catch (error) {
          logger.warn("API logout failed", {
            error: error instanceof Error ? error.message : String(error),
          });
        }

        router.replace(getSignInUrl(locale));
      },
    },
  }));
};
```

**Example 2: File Upload Hook** (`apps/grower/src/hooks/use-farm-document-upload.ts`):

```typescript
import { logger } from "@/lib/utils/logger";

export function useFarmDocumentUpload() {
  const uploadDocument = async (file: File, farmId: string) => {
    logger.info("Starting document upload", {
      fileName: file.name,
      fileSize: file.size,
      farmId,
    });

    try {
      const result = await api.uploadDocument(file, farmId);

      logger.info("Document upload successful", {
        documentId: result.id,
        farmId,
      });

      return result;
    } catch (error) {
      logger.error("Document upload failed", {
        fileName: file.name,
        farmId,
        error,
      });
      throw error;
    }
  };

  return { uploadDocument };
}
```

**Available Log Levels**:

```typescript
import { logger } from "@/lib/utils/logger";

// Debug (development only)
logger.debug("Detailed debug information", { data: complexObject });

// Info - General informational messages
logger.info("User action completed", { userId: "123", action: "create-farm" });

// Warn - Warning messages
logger.warn("Deprecated feature used", { feature: "old-api" });

// Error - Error conditions
logger.error("API request failed", {
  endpoint: "/api/farms",
  statusCode: 500,
  error,
});

// Fatal - Critical errors
logger.fatal("Database connection lost", error);
```

**Child Loggers** for module-specific context:

```typescript
import { logger } from "@/lib/logger";

// Create module-specific loggers
const authLogger = logger.child({ module: "auth" });
const paymentLogger = logger.child({ module: "payment" });

// All logs from authLogger will include { module: 'auth' }
authLogger.info("User logged in", { userId: "123" });
// Output: { level: 'info', module: 'auth', message: 'User logged in', userId: '123' }

paymentLogger.error("Payment failed", { amount: 100 });
// Output: { level: 'error', module: 'payment', message: 'Payment failed', amount: 100 }
```

**Best Practices**:

1. **Always include context**: Add relevant metadata to logs
2. **Use appropriate levels**: Don't use `error` for warnings
3. **Log business events**: Track important user actions
4. **Don't log sensitive data**: Avoid passwords, tokens, PII
5. **Use child loggers**: Create module-specific loggers for better filtering

### 5. **@cf/redis** - Redis Client

Upstash Redis client for caching and rate limiting.

**Location**: `packages/redis/`

---

## Making API Requests

The CF platform uses a sophisticated API client system with separate client-side and server-side implementations.

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│  /api/proxy  │────────▶│   Backend   │
│ Components  │         │  (Next.js)   │         │     API     │
└─────────────┘         └──────────────┘         └─────────────┘
     ▲                                                    ▲
     │                                                    │
     └────────────────────────────────────────────────────┘
              Server Components (direct access)
```

### Client-Side API Usage

Use the `useApiClient()` hook in Client Components:

```typescript
"use client";

import { useApiClient } from "@/lib/api/client";
import { useEffect, useState } from "react";

export function FarmList() {
  const api = useApiClient();
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    async function loadFarms() {
      // Type-safe API call
      const { data, error } = await api.client.GET("/api/farms");

      if (error) {
        console.error("Failed to load farms:", error);
        return;
      }

      setFarms(data?.items || []);
    }

    loadFarms();
  }, [api]);

  return (
    <div>
      {farms.map(farm => (
        <div key={farm.id}>{farm.name}</div>
      ))}
    </div>
  );
}
```

**Using React Query** (recommended for data fetching):

```typescript
"use client";

import { useApiClient } from "@/lib/api/client";

export function FarmList() {
  const api = useApiClient();

  // Use React Query hooks from openapi-react-query
  const { data, isLoading, error } = api.useQuery(
    "get",
    "/api/farms"
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.items?.map(farm => (
        <div key={farm.id}>{farm.name}</div>
      ))}
    </div>
  );
}
```

**Mutations**:

```typescript
"use client";

import { useApiClient } from "@/lib/api/client";

export function CreateFarmForm() {
  const api = useApiClient();

  const { mutate, isPending } = api.useMutation(
    "post",
    "/api/farms"
  );

  const handleSubmit = (formData: FarmInput) => {
    mutate(
      { body: formData },
      {
        onSuccess: (data) => {
          console.log("Farm created:", data);
        },
        onError: (error) => {
          console.error("Failed to create farm:", error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Farm"}
      </button>
    </form>
  );
}
```

### Server-Side API Usage

Use `getServerApiClient()` in Server Components, Route Handlers, or Server Actions:

```typescript
// In a Server Component
import { getServerApiClient } from "@/lib/api/server";

export default async function FarmsPage() {
  const api = await getServerApiClient();

  const { data, error } = await api.client.GET("/api/farms");

  if (error) {
    return <div>Failed to load farms</div>;
  }

  return (
    <div>
      {data?.items?.map(farm => (
        <div key={farm.id}>{farm.name}</div>
      ))}
    </div>
  );
}
```

**In a Route Handler**:

```typescript
// app/api/my-endpoint/route.ts
import { getServerApiClient } from "@/lib/api/server";
import { NextResponse } from "next/server";

export async function GET() {
  const api = await getServerApiClient();

  const { data, error } = await api.client.GET("/api/farms");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch farms" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
```

**In a Server Action**:

```typescript
"use server";

import { getServerApiClient } from "@/lib/api/server";

export async function createFarm(formData: FormData) {
  const api = await getServerApiClient();

  const { data, error } = await api.client.POST("/api/farms", {
    body: {
      name: formData.get("name") as string,
      size: Number(formData.get("size")),
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

### API Authentication Flow

1. **Client-Side**:

   - Requests go through `/api/proxy` endpoint
   - Auth tokens stored in HTTP-only cookies
   - Proxy injects tokens server-side

2. **Server-Side**:
   - Gets Clerk token from session
   - Exchanges for internal JWT
   - Direct authenticated request to backend

### Available HTTP Methods

The API client supports all standard HTTP methods:

```typescript
// GET request
const { data } = await api.client.GET("/api/endpoint");

// POST request with body
const { data } = await api.client.POST("/api/endpoint", {
  body: { name: "value" },
});

// PUT request
const { data } = await api.client.PUT("/api/endpoint/{id}", {
  params: { path: { id: "123" } },
  body: { name: "updated" },
});

// PATCH request
const { data } = await api.client.PATCH("/api/endpoint/{id}", {
  params: { path: { id: "123" } },
  body: { field: "value" },
});

// DELETE request
const { data } = await api.client.DELETE("/api/endpoint/{id}", {
  params: { path: { id: "123" } },
});
```

### Type Safety

All endpoints are fully typed based on the OpenAPI schema:

```typescript
// TypeScript knows the exact shape of request/response
const { data } = await api.client.GET("/api/farms/{farmId}", {
  params: {
    path: { farmId: "123" }, // Required path param
    query: { include: "crops" }, // Optional query param
  },
});

// data is typed as Farm | undefined
// error is typed as ErrorResponse | undefined
```

---

## Authentication & User Management

### Authentication Architecture

The platform uses a dual-authentication system:

1. **Clerk** (External OAuth) - User identity and session management
2. **Internal JWT** - Backend API authentication

```
┌──────────┐    1. OAuth    ┌───────┐    2. Exchange    ┌──────────┐
│  Client  │───────────────▶│ Clerk │──────────────────▶│ Backend  │
└──────────┘                └───────┘                    └──────────┘
     │                                                         │
     │                   3. JWT Access Token                  │
     └────────────────────────────────────────────────────────┘
```

### Getting the Current User

#### In Client Components

```typescript
"use client";

import { useAuth } from "@clerk/nextjs";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

export function UserProfile() {
  // Clerk auth info
  const { userId, isSignedIn, isLoaded } = useAuth();

  // Internal auth info (from JWT)
  const { userId: internalUserId, email, roles } = useAuthUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return (
    <div>
      <p>Clerk User ID: {userId}</p>
      <p>Email: {email}</p>
      <p>Roles: {roles?.join(", ")}</p>
    </div>
  );
}
```

#### In Server Components

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  // Get auth info
  const { userId } = await auth();

  // Get full user object
  const user = await currentUser();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

#### Protecting Routes

**Middleware Protection** (`middleware.ts`):

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(.*)/sign-in(.*)",
  "/(.*)/sign-up(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Component-Level Protection**:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div>Protected content</div>;
}
```

### Auth Store

The `auth-store-ssr` manages internal JWT tokens and user metadata.

**Available Hooks**:

```typescript
import {
  useAuthUser,        // Get user info (userId, email, roles)
  useAuthTokens,      // Get token metadata (expiresAt)
  useAuthActions,     // Get auth actions
  useIsAuthenticated, // Check if authenticated
} from "@/lib/stores/auth-store-ssr";

// Usage
function MyComponent() {
  const { userId, email, roles } = useAuthUser();
  const { expiresAt } = useAuthTokens();
  const { logout, refreshTokens } = useAuthActions();
  const isAuthenticated = useIsAuthenticated();

  const handleLogout = async () => {
    await logout(signOut, router, "en");
  };

  return <div>{email}</div>;
}
```

### Token Flow

1. **User signs in** → Clerk creates session
2. **Token exchange** → Clerk token exchanged for internal JWT
3. **Storage** → JWT stored in HTTP-only cookie
4. **API calls** → JWT automatically injected
5. **Token refresh** → Automatic refresh before expiration
6. **Logout** → Clears all tokens and redirects

---

## Using UI Components

All UI components come from `@cf/ui` package, built on shadcn/ui patterns.

### Basic Component Usage

```typescript
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
} from "@cf/ui";

export function ExampleForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Farm</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Farm Name</Label>
            <Input id="name" placeholder="Enter farm name" />
          </div>

          <Button type="submit">Create Farm</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Styling with Tailwind

Components accept `className` prop for customization:

```typescript
import { Button, cn } from "@cf/ui";

export function CustomButton() {
  return (
    <>
      {/* Default styling */}
      <Button>Click me</Button>

      {/* Custom styling */}
      <Button className="bg-green-500 hover:bg-green-600">
        Green Button
      </Button>

      {/* Conditional styling with cn utility */}
      <Button
        className={cn(
          "w-full",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </>
  );
}
```

### Form Components with react-hook-form

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Input,
} from "@cf/ui";

// Define validation schema
const formSchema = z.object({
  farmName: z.string().min(3, "Name must be at least 3 characters"),
  size: z.number().positive("Size must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function FarmForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmName: "",
      size: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="farmName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size (hectares)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Farm</Button>
      </form>
    </Form>
  );
}
```

### Component Examples from Codebase

**Example 1: Selection Card** (`apps/grower/src/components/onboarding/farming-card.tsx`):

```typescript
import { cn } from "@cf/ui";
import { Badge } from "@cf/ui/components/badge";
import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface FarmingCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  isComingSoon?: boolean;
}

export function FarmingCard({
  icon,
  label,
  selected,
  onClick,
  isComingSoon = false,
}: FarmingCardProps) {
  const t = useTranslations("onboarding");

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border transition hover:shadow-md",
        selected && !isComingSoon
          ? "border-primary bg-primary/10 ring-primary ring-2"
          : "border-muted-foreground/40 bg-white",
        isComingSoon && "cursor-not-allowed opacity-60"
      )}
    >
      {isComingSoon && (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="rounded-full bg-blue-500">
            {t("coming-soon")}
          </Badge>
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={isComingSoon}
        className="flex w-full items-center justify-between gap-4 p-1.5"
      >
        <div className="flex items-center gap-4">
          <div className="size-[80px]">
            <Image
              src={icon}
              alt={label}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          </div>
          <span className="text-md font-semibold">{label}</span>
        </div>

        {selected && !isComingSoon && (
          <div className="bg-primary absolute right-3 top-3 z-10 rounded-full p-1.5">
            <Check size={10} color="white" />
          </div>
        )}
      </button>
    </div>
  );
}
```

### Common UI Patterns

**Loading States**:

```typescript
import { Skeleton } from "@cf/ui";

export function LoadingCard() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </CardContent>
    </Card>
  );
}
```

**Toast Notifications**:

```typescript
import { useToast } from "@cf/ui";

export function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Success!",
      description: "Farm created successfully",
      variant: "default", // or "destructive"
    });
  };

  return <Button onClick={handleAction}>Create</Button>;
}
```

**Dialogs**:

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cf/ui";

export function DeleteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <p>This action cannot be undone.</p>
        <Button variant="destructive">Confirm Delete</Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Theming & Styling System

The CF platform uses a centralized theming system with **Tailwind CSS** and **CSS custom properties** (CSS variables) defined in HSL format.

### Architecture Overview

```
packages/ui/src/styles/
├── globals.css       # Base theme (Grower app - Green)
├── buyer.css         # Buyer app override (Teal/Cyan)
└── admin.css         # Admin app override (Green variant)
```

**How it works:**

1. Each app imports a specific CSS file from `@cf/ui/styles/`
2. All CSS files define the same CSS variable names
3. Apps override colors by importing different stylesheets
4. Tailwind config references these CSS variables

### App-Specific Imports

**Grower App** (`apps/grower/src/app/layout.tsx`):

```typescript
import "@cf/ui/styles/globals.css"; // Green theme
```

**Buyer App** (`apps/buyer/src/app/layout.tsx`):

```typescript
import "@cf/ui/styles/buyer.css"; // Teal/Cyan theme
```

**Admin App** (`apps/admin/src/app/layout.tsx`):

```typescript
import "@cf/ui/styles/admin.css"; // Admin theme
```

### Color System

All colors are defined using **HSL format** (Hue, Saturation, Lightness) without the `hsl()` wrapper:

```css
/* Format: H S% L% */
--primary: 125 49% 48%; /* Green: #3FB648 */
```

This format allows Tailwind to add opacity modifiers:

```tsx
<div className="bg-primary/50">     {/* 50% opacity */}
<div className="text-primary/20">   {/* 20% opacity */}
```

### Available Color Variables

#### Core Colors

| Variable               | Usage                                          | Example                    |
| ---------------------- | ---------------------------------------------- | -------------------------- |
| `--primary`            | Brand color (Green for Grower, Teal for Buyer) | Buttons, links, highlights |
| `--primary-foreground` | Text on primary backgrounds                    | Button text                |
| `--primary-light`      | Light variant                                  | Hover states, backgrounds  |
| `--primary-dark`       | Dark variant                                   | Active states              |
| `--secondary`          | Secondary actions                              | Secondary buttons          |
| `--background`         | Page background                                | Body background            |
| `--foreground`         | Primary text color                             | Body text                  |

#### Extended Primary Variants

| Variable                | Description         |
| ----------------------- | ------------------- |
| `--primary-bright`      | Very bright variant |
| `--primary-semi`        | Semi-dark variant   |
| `--primary-darkest`     | Darkest variant     |
| `--primary-lightest`    | Lightest variant    |
| `--primary-icon-light`  | Icon backgrounds    |
| `--primary-icon-bright` | Bright icons        |

#### Semantic Colors

| Variable                   | Usage                           |
| -------------------------- | ------------------------------- |
| `--destructive`            | Errors, delete actions          |
| `--destructive-foreground` | Text on destructive backgrounds |
| `--muted`                  | Subtle backgrounds              |
| `--muted-foreground`       | Subtle text                     |
| `--accent`                 | Accent elements                 |
| `--border`                 | Border color                    |
| `--input`                  | Input backgrounds               |
| `--ring`                   | Focus rings                     |

#### Custom Colors

| Variable           | Usage               | Colors  |
| ------------------ | ------------------- | ------- |
| `--gray-light`     | Light gray          | #E8EBE1 |
| `--gray-semi-dark` | Medium gray         | #D3D6CE |
| `--gray-dark`      | Dark gray           | #71786C |
| `--red-light`      | Error backgrounds   | #FFDAD6 |
| `--red-dark`       | Error text          | #8F0004 |
| `--blue-light`     | Info backgrounds    | #D5E6FD |
| `--blue-dark`      | Info text           | #00439E |
| `--blue-semi`      | Links               | #0063EA |
| `--yellow-light`   | Warning backgrounds |         |
| `--yellow-dark`    | Warning text        |         |

#### Component-Specific

| Variable                      | Usage                 |
| ----------------------------- | --------------------- |
| `--card`                      | Card backgrounds      |
| `--popover`                   | Popover backgrounds   |
| `--tab-bar-background`        | Bottom tab bar        |
| `--tab-bar-active-background` | Active tab            |
| `--container`                 | Container backgrounds |
| `--empty-state-background`    | Empty state screens   |

### Using Colors in Components

**With Tailwind Classes:**

```tsx
import { Button, Card } from "@cf/ui";

export function MyComponent() {
  return (
    <Card className="bg-primary-light border-primary">
      <h2 className="text-primary-dark">Title</h2>
      <p className="text-muted-foreground">Description</p>

      <Button className="bg-primary text-primary-foreground">
        Primary Action
      </Button>

      <Button className="bg-secondary text-secondary-foreground">
        Secondary Action
      </Button>

      {/* With opacity */}
      <div className="bg-primary/10 text-primary/80">
        Subtle primary background
      </div>
    </Card>
  );
}
```

**Custom Colors:**

```tsx
<div className="bg-gray-light text-gray-dark">
  Custom gray content
</div>

<div className="bg-blue-light text-blue-dark">
  Info message
</div>

<div className="bg-red-light text-red-dark">
  Error message
</div>
```

### Adding a New Color

Follow these steps to add a new color to the design system:

#### Step 1: Convert Your Color to HSL

If you have a hex color (e.g., `#FF6B6B`), convert it to HSL:

```
Hex: #FF6B6B
RGB: rgb(255, 107, 107)
HSL: hsl(0, 100%, 71%)
```

**Remove the `hsl()` wrapper** for CSS variables:

```
Format: 0 100% 71%
```

**Online Tools:**

- [HSL Color Picker](https://hslpicker.com/)
- [Coolors Converter](https://coolors.co/convert)

#### Step 2: Add to Tailwind Config

Open `tooling/tailwind-config/index.ts` and add your color to the `colors` object:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // ... existing colors
        "my-custom-color": {
          DEFAULT: "hsl(var(--my-custom-color))",
          light: "hsl(var(--my-custom-color-light))",
          dark: "hsl(var(--my-custom-color-dark))",
        },
      },
    },
  },
} satisfies Config;
```

#### Step 3: Define CSS Variables in Base Styles

**For Global Usage (All Apps):**

Edit `packages/ui/src/styles/globals.css`:

```css
@layer base {
  :root {
    /* ... existing variables */

    /* My custom color */
    --my-custom-color: 0 100% 71%; /* Base color */
    --my-custom-color-light: 0 100% 85%; /* Light variant */
    --my-custom-color-dark: 0 80% 50%; /* Dark variant */
  }
}
```

**For App-Specific Colors:**

Only add to the specific app's CSS file (e.g., `buyer.css`):

```css
@layer base {
  :root {
    /* Buyer-specific color */
    --buyer-special: 176 32% 43%;
  }
}
```

Then add to the app's Tailwind config (`apps/buyer/tailwind.config.ts`):

```typescript
export default {
  presets: [baseConfig],
  theme: {
    extend: {
      colors: {
        "buyer-special": {
          DEFAULT: "hsl(var(--buyer-special))",
        },
      },
    },
  },
} satisfies Config;
```

#### Step 4: Use Your New Color

```tsx
// In any component
<div className="bg-my-custom-color text-my-custom-color-dark">
  Content with new color
</div>

// With opacity
<div className="bg-my-custom-color/20">
  Subtle background
</div>
```

### Theme Color Examples by App

**Grower (Green Theme):**

```css
--primary: 125 49% 48%; /* #3FB648 - Main green */
--primary-light: 78 19% 90%; /* Light green background */
--primary-dark: 113 46% 29%; /* Dark green */
```

**Buyer (Teal Theme):**

```css
--primary: 176 32% 43%; /* Teal/Cyan */
--primary-light: 0 0% 96%; /* Light gray */
--primary-dark: 177 100% 9%; /* Very dark teal */
```

**Admin (Green Variant):**

```css
--primary: 125 49% 48%; /* Same as Grower */
/* But with different secondary colors */
```

### Best Practices

1. **Use semantic names** - Prefer `primary`, `destructive`, `muted` over `green`, `red`, `gray`
2. **Maintain consistency** - If adding a new color, add it to ALL app stylesheets
3. **Test in all apps** - Color changes affect multiple apps
4. **Use HSL format** - Required for Tailwind opacity modifiers
5. **Document your colors** - Add comments with hex values
6. **Follow existing patterns** - Look at how current colors are defined
7. **Consider dark mode** - Add dark mode variants if needed

### Debugging Theme Issues

**Check what CSS file is loaded:**

```typescript
// In app/layout.tsx
import "@cf/ui/styles/globals.css"; // Which file?
```

**Inspect CSS variables in browser:**

```javascript
// Open DevTools Console
getComputedStyle(document.documentElement).getPropertyValue("--primary");
// Output: "125 49% 48%"
```

**Verify Tailwind is processing your color:**

```tsx
// This should show the color
<div className="bg-primary">Test</div>

// If not working, check:
// 1. CSS variable exists in the stylesheet
// 2. Color is defined in tailwind.config.ts
// 3. You're using the correct import
```

### Generic vs App-Specific Approach

**✅ Recommended (Generic):**

Define colors in the base config and override via CSS variables:

```typescript
// tailwind.config.ts (base)
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
  }
}
```

```css
/* globals.css */
--primary: 125 49% 48%; /* Green */

/* buyer.css */
--primary: 176 32% 43%; /* Teal */
```

**❌ Not Recommended (App-Specific):**

Don't add app-specific color names to the base Tailwind config:

```typescript
// Don't do this
colors: {
  "grower-green": "...",
  "buyer-teal": "...",
}
```

Instead, use the same variable names and change the CSS values per app.

---

## State Management

The CF platform uses **Zustand** for client-side state management with localStorage persistence.

### Creating a Store

Stores are located in `apps/{app}/src/lib/stores/`.

**Example: Simple Store**:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FarmStore {
  selectedFarmId: string | null;
  farms: Farm[];
  setSelectedFarmId: (id: string | null) => void;
  setFarms: (farms: Farm[]) => void;
  addFarm: (farm: Farm) => void;
}

export const useFarmStore = create<FarmStore>()(
  persist(
    (set) => ({
      selectedFarmId: null,
      farms: [],

      setSelectedFarmId: (id) => set({ selectedFarmId: id }),

      setFarms: (farms) => set({ farms }),

      addFarm: (farm) =>
        set((state) => ({
          farms: [...state.farms, farm],
        })),
    }),
    {
      name: "farm-storage", // localStorage key
      // Only persist certain fields
      partialize: (state) => ({
        selectedFarmId: state.selectedFarmId,
        // Don't persist farms (fetch from API)
      }),
    },
  ),
);
```

### Using Stores in Components

```typescript
"use client";

import { useFarmStore } from "@/lib/stores/farm-store";

export function FarmSelector() {
  // Get specific state and actions
  const selectedFarmId = useFarmStore((state) => state.selectedFarmId);
  const farms = useFarmStore((state) => state.farms);
  const setSelectedFarmId = useFarmStore((state) => state.setSelectedFarmId);

  return (
    <select
      value={selectedFarmId ?? ""}
      onChange={(e) => setSelectedFarmId(e.target.value)}
    >
      <option value="">Select a farm</option>
      {farms.map((farm) => (
        <option key={farm.id} value={farm.id}>
          {farm.name}
        </option>
      ))}
    </select>
  );
}
```

### Real Example: Sign-Up Store

From `apps/grower/src/lib/stores/sign-up-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FarmingExperience = "newbie" | "experienced";

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SignUpStore {
  // State
  basicInfo: Partial<BasicInfo>;
  farmingExperience: FarmingExperience | null;
  currentStep: number;
  totalSteps: number;

  // Actions
  setBasicInfo: (data: Partial<BasicInfo>) => void;
  setFarmingExperience: (experience: FarmingExperience) => void;
  setCurrentStep: (step: number) => void;
  resetFlow: () => void;
}

const initialState = {
  basicInfo: {},
  farmingExperience: null,
  currentStep: 1,
  totalSteps: 4,
};

export const useSignUpStore = create<SignUpStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBasicInfo: (data) =>
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...data },
        })),

      setFarmingExperience: (experience) =>
        set({
          farmingExperience: experience,
          totalSteps: experience === "newbie" ? 11 : 14,
        }),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetFlow: () => set(initialState),
    }),
    {
      name: "sign-up-storage",
      partialize: (state) => ({
        basicInfo: state.basicInfo,
        farmingExperience: state.farmingExperience,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
      }),
    },
  ),
);
```

**Using the Sign-Up Store**:

```typescript
"use client";

import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function OnboardingFlow() {
  const currentStep = useSignUpStore((state) => state.currentStep);
  const totalSteps = useSignUpStore((state) => state.totalSteps);
  const setCurrentStep = useSignUpStore((state) => state.setCurrentStep);
  const setBasicInfo = useSignUpStore((state) => state.setBasicInfo);

  const handleNext = () => {
    setBasicInfo({ firstName: "John", lastName: "Doe" });
    setCurrentStep(currentStep + 1);
  };

  return (
    <div>
      <p>Step {currentStep} of {totalSteps}</p>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

### Auth Store (Advanced Example)

The auth store uses a provider pattern for SSR compatibility:

```typescript
// Setup (already done in layout)
import { AuthStoreProvider } from "@/lib/stores/auth-store-ssr";

export default function Layout({ children }) {
  return (
    <AuthStoreProvider>
      {children}
    </AuthStoreProvider>
  );
}

// Usage in components
import {
  useAuthUser,
  useAuthActions
} from "@/lib/stores/auth-store-ssr";

export function UserMenu() {
  const { userId, email, roles } = useAuthUser();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await logout(signOut, router, locale);
  };

  return (
    <div>
      <p>{email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Store Best Practices

1. **Separate concerns**: One store per domain (auth, farms, orders, etc.)
2. **Persist selectively**: Only persist user preferences, not API data
3. **Use selectors**: Select only the state you need to prevent unnecessary re-renders
4. **Actions pattern**: Group related mutations as methods
5. **SSR-safe**: Use `skipHydration: true` for SSR compatibility

---

## Common Workflows

### 1. Adding a New Page

**Step 1**: Create page file in appropriate route:

```bash
# For grower app
touch apps/grower/src/app/[locale]/(dashboard)/my-feature/page.tsx
```

**Step 2**: Implement the page:

```typescript
import { getServerApiClient } from "@/lib/api/server";
import { Card, CardHeader, CardTitle, CardContent } from "@cf/ui";

export default async function MyFeaturePage() {
  // Fetch data server-side
  const api = await getServerApiClient();
  const { data } = await api.client.GET("/api/my-data");

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Feature</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3**: Add to navigation (if needed):

```typescript
// apps/grower/src/config/navigation.ts
export const navigationItems = [
  // ... existing items
  {
    label: "My Feature",
    href: "/my-feature",
    icon: "...",
  },
];
```

**Step 4**: Add translations:

```json
// apps/grower/messages/en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

### 2. Adding a New API Endpoint Integration

**Step 1**: Regenerate types if backend endpoint is new:

```bash
cd packages/api
bun run generate
```

**Step 2**: Use the endpoint in your component:

```typescript
"use client";

import { useApiClient } from "@/lib/api/client";

export function MyComponent() {
  const api = useApiClient();

  const { data, isLoading } = api.useQuery("get", "/api/new-endpoint");

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 3. Creating a New Component

**Step 1**: Decide if it's app-specific or shared:

- **Shared**: Add to `packages/ui/src/components/`
- **App-specific**: Add to `apps/{app}/src/components/`

**Step 2**: Create the component:

```typescript
// packages/ui/src/components/my-component.tsx
import * as React from "react";
import { cn } from "../utils/cn";

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

export function MyComponent({
  className,
  variant = "default",
  ...props
}: MyComponentProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4",
        variant === "default" && "bg-primary text-white",
        variant === "outline" && "border border-primary",
        className
      )}
      {...props}
    />
  );
}
```

**Step 3**: Export from index (if in packages/ui):

```typescript
// packages/ui/src/index.ts
export * from "./components/my-component";
```

### 4. Adding Form Validation

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApiClient } from "@/lib/api/client";
import { Form, FormField, Button, Input } from "@cf/ui";
import { useToast } from "@cf/ui";

// 1. Define schema
const schema = z.object({
  name: z.string().min(3, "Must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  size: z.number().positive("Must be positive"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const api = useApiClient();
  const { toast } = useToast();

  // 2. Setup form
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", size: 0 },
  });

  // 3. Setup mutation
  const { mutate, isPending } = api.useMutation("post", "/api/farms");

  // 4. Submit handler
  const onSubmit = (data: FormData) => {
    mutate(
      { body: data },
      {
        onSuccess: () => {
          toast({ title: "Success!", description: "Farm created" });
          form.reset();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

### 5. Adding Internationalization

**Step 1**: Add translations to all language files:

```json
// messages/en.json
{
  "myFeature": {
    "title": "My Feature",
    "button": "Click here"
  }
}

// messages/es.json
{
  "myFeature": {
    "title": "Mi Función",
    "button": "Haz clic aquí"
  }
}

// messages/fr.json
{
  "myFeature": {
    "title": "Ma Fonctionnalité",
    "button": "Cliquez ici"
  }
}
```

**Step 2**: Use in component:

```typescript
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("myFeature");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("button")}</button>
    </div>
  );
}
```

### 6. Testing Your Code

**Unit Test Example**:

```typescript
// my-component.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("My Component")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const { user } = render(<MyComponent />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

**Run tests**:

```bash
bun run test                    # Watch mode
bun run test:coverage           # With coverage
bun run test -- my-component    # Specific test
```

---

## Project-Specific Conventions

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: kebab-case (`format-date.ts`)
- **Pages**: kebab-case (`farm-details/page.tsx`)
- **Stores**: kebab-case (`auth-store.ts`)

### Import Paths

Use absolute imports with `@/` alias:

```typescript
// ✅ Correct
import { Button } from "@cf/ui";
import { useApiClient } from "@/lib/api/client";
import { logger } from "@cf/logger";

// ❌ Incorrect
import { Button } from "../../../packages/ui/src/components/button";
```

### TypeScript

- **No `any` types** - Always provide proper types
- **Strict mode enabled** - Fix all type errors
- **Use interfaces for objects**:
  ```typescript
  interface UserProfile {
    id: string;
    name: string;
    email: string;
  }
  ```

### Component Structure

```typescript
"use client"; // Only if client-side features needed

// 1. External imports
import { useState } from "react";
import { useTranslations } from "next-intl";

// 2. Internal imports
import { Button } from "@cf/ui";
import { useApiClient } from "@/lib/api/client";

// 3. Types
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 4. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const t = useTranslations();
  const [state, setState] = useState();

  // Handlers
  const handleClick = () => {
    onAction();
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

**1. "Module not found: @cf/..."**

```bash
# Rebuild packages
bun run build

# Or reinstall
bun install
```

**2. TypeScript errors after pulling**

```bash
bun run typecheck
```

**3. API types out of sync**

```bash
cd packages/api
bun run generate
```

**4. Port already in use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**5. Authentication not working**

- Check `.env.local` has Clerk keys
- Verify cookies are not blocked
- Clear browser cookies
- Check auth store state in React DevTools

---

## Next Steps

1. **Explore the codebase**: Browse through existing pages and components
2. **Pick up a task**: Look for `good-first-issue` labels
3. **Ask questions**: Don't hesitate to ask the team
4. **Read the docs**: Check `docs/` folder for architecture decisions
5. **Make your first PR**: Start with a small fix or feature

Welcome aboard! 🚀
