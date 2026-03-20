# Authentication Configuration

This directory contains configuration for authentication and role-based routing.

## Usage

### Role-Based Routing with Wildcards

The `ROLE_ROUTING_CONFIG` in `auth.ts` supports wildcard patterns for flexible route matching:

```typescript
import { ROLE_ROUTING_CONFIG } from "@/lib/config/auth";

// Example configuration for a new role
const NewUserRole = {
  dashboard: "/new-user/welcome",
  allowedPaths: [
    "/new-user/*", // Allows all sub-paths under /new-user
    "/profile", // Exact match for /profile
    "/profile/*", // All sub-paths under /profile
    "/onboarding/*", // All onboarding steps
  ],
};
```

### Adding a New Role

To add a new role with wildcard support:

1. Add the role to `ROLE_ROUTING_CONFIG`:

```typescript
export const ROLE_ROUTING_CONFIG: Record<string, RoleRoutingConfig> = {
  // ... existing roles
  NewUser: {
    dashboard: "/onboarding/start",
    allowedPaths: ["/onboarding/*", "/help", "/help/*"],
  },
};
```

2. Update the role detection logic in `useSessionSync` if needed:

```typescript
const primaryRole = userRoles.includes("NewUser")
  ? "NewUser"
  : userRoles.includes("Farmer")
  ? "Farmer"
  : // ... rest of logic
```

### Wildcard Patterns

- `/path/*` - Matches `/path` and any sub-path (e.g., `/path/sub`, `/path/sub/deep`)
- `/path` - Exact match only
- Multiple patterns can be combined for flexibility

### Example: Onboarding Flow

```typescript
Onboarding: {
  dashboard: "/onboarding/start",
  allowedPaths: [
    "/onboarding/*",  // All onboarding steps
  ],
}
```

This allows users with the "Onboarding" role to access:

- `/onboarding/start`
- `/onboarding/profile-setup`
- `/onboarding/preferences`
- `/onboarding/complete`
- Any other path under `/onboarding/`

But restricts access to other parts of the application until onboarding is complete.
