# AGENT.md

This file provides guidance to AI agents (Cursor, Windsurf, Copilot, etc.) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo for the CF (CrowdFarming) platform, using Bun as the package manager and Next.js 15 as the primary framework.

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: Bun v1.1.10
- **Build System**: Turborepo
- **Styling**: Tailwind CSS
- **UI Components**: Custom library based on shadcn/ui (`packages/ui`)
- **Authentication**: Clerk (external) + JWT (internal)
- **State Management**: Zustand with localStorage persistence
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Monitoring**: Sentry, PostHog, Pino logger
- **Form Handling**: react-hook-form + zod validation
- **Internationalization**: next-intl (en, es, fr)
- **Maps**: Mapbox GL JS

## Essential Commands

```bash
# Development
bun run dev                  # Start all apps in parallel
bun run dev:grower          # Start only the grower app
bun run dev:buyer           # Start only the buyer app (port 3010)
bun run dev:auth-proxy      # Start only the auth proxy

# Building & Analysis
bun run build               # Build all apps and packages
bun run analyze             # Build with bundle analyzer

# Testing
bun run test                # Run unit tests in watch mode (Vitest)
bun run test:coverage       # Run tests with coverage report
bun run test:ui             # Run tests with Vitest UI
bun run test:e2e            # Run E2E tests (Playwright)
bun run test:e2e:ui         # Run E2E tests with UI
bun run test -- path/to/test.spec.ts  # Run specific test file

# Code Quality
bun run lint                # Run ESLint on all packages
bun run lint:fix            # Auto-fix ESLint issues
bun run format              # Check Prettier formatting
bun run format:fix          # Auto-fix formatting issues
bun run typecheck           # Run TypeScript type checking

# Dependency Management (Syncpack)
bun run deps:check          # Check for version mismatches
bun run deps:fix            # Fix version mismatches automatically
bun run deps:list           # List all dependencies across monorepo
bun run deps:update         # Update dependencies interactively
bun run deps:lint           # Check semver range policies

# Git Workflow
bun run commit              # Interactive commit with Commitizen

# Utilities
bun run clean               # Clean all node_modules
bun run clean:workspaces    # Clean workspace build artifacts
bun run gen                 # Run Turbo generators
```

## Project Structure

```
apps/
├── admin/              # Admin dashboard Next.js app
├── auth-proxy/         # Authentication proxy service
├── buyer/              # Buyer platform Next.js app
└── grower/             # Main Next.js app for farmers

packages/
├── ui/                 # Shared UI components (shadcn-based)
├── api/                # API client and type definitions
├── auth/               # Authentication utilities
├── common/             # Shared types and utilities
└── logger/             # Centralized logging (Pino)

tooling/
├── eslint-config/      # Shared ESLint configuration
├── prettier-config/    # Shared Prettier configuration
├── tailwind-config/    # Shared Tailwind configuration
└── typescript-config/  # Shared TypeScript configuration
```

## Architecture Patterns

### Authentication Flow

- Currently using client-side authentication via Clerk
- JWT tokens stored in cookies for API access
- Planning migration to server-side sessions (see `docs/architecture/session-migration-analysis.md`)
- Auth state managed via Zustand with localStorage persistence

### API Integration

- API client in `packages/api` handles all backend communication
- Base URL configured via `NEXT_PUBLIC_API_BASE_URL`
- Automatic token injection for authenticated requests
- Type-safe API methods with TypeScript

### Routing Structure

**Grower App** (`apps/grower/src/app/[locale]/`):

```
├── (auth)/             # Auth-related pages (login, signup, etc.)
├── (dashboard)/        # Dashboard pages
├── (marketing)/        # Public marketing pages
├── (platform)/         # Main application (requires auth)
├── dashboard/          # Dashboard routes
├── onboarding/         # User onboarding flows
├── oops/               # Error pages
└── unauthorized/       # Unauthorized access page
```

**Buyer App** and **Admin App** follow similar patterns with locale-based routing.

### Component Patterns

- Server Components by default in Next.js 15
- Client Components marked with 'use client' when needed
- Shared components in `packages/ui` follow shadcn patterns
- Form handling with react-hook-form and zod validation

### State Management

- Zustand stores in `apps/grower/src/stores/`
- Persistent state via localStorage
- Server state handled by React Query (via API package)

## Development Guidelines

### When Adding New Features

1. Check if similar patterns exist in the codebase first
2. Use existing UI components from `packages/ui`
3. Follow the established file structure patterns
4. Add appropriate TypeScript types to `packages/common`
5. Use the logger from `packages/logger` for debugging

### Testing Approach

- Unit tests with Vitest for utilities and hooks
- Component tests for complex UI logic
- E2E tests with Playwright for critical user flows
- Test files colocated with source files (`*.test.ts`, `*.spec.ts`)
- Vitest config supports multiple projects (buyer, grower)
- Test environments: jsdom for React components

### Internationalization

- Use `next-intl` for all user-facing text
- Translations in `apps/grower/messages/`
- Supported locales: en, es, fr
- Always use translation keys, never hardcode text

### Environment Variables

- Development: `.env.local` (not in git)
- Required vars documented in `.env.example`
- Client-side vars must be prefixed with `NEXT_PUBLIC_`

## Environment Setup

### Required Environment Variables

Create `.env.local` files in the root and app directories:

```bash
# Copy environment templates
cp .env.example .env.local
cp apps/grower/.env.example apps/grower/.env.local
cp apps/auth-proxy/.env.example apps/auth-proxy/.env.local
```

Key variables to configure:

- **Clerk Auth**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **API**: `NEXT_PUBLIC_API_BASE_URL` (defaults to http://localhost:8000)
- **Mapbox**: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Analytics**: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN`

## 🤖 AI Agent Instructions

### Code Generation Rules

1. **NEVER add comments unless explicitly requested**
2. **Follow existing patterns** - Always check similar files first
3. **Use TypeScript strict mode** - No `any` types without justification
4. **Prefer functional components** - Use hooks over class components
5. **Use existing utilities** - Check `packages/` before creating new ones

### Import Guidelines

```typescript
// ✅ Correct import order
import { type FC } from "react"; // 1. React imports
import { useRouter } from "next/navigation"; // 2. Next.js imports
import { Button } from "@/components/ui/button"; // 3. Internal packages
import { cn } from "@/lib/utils"; // 4. Local utilities
import type { User } from "@/types"; // 5. Type imports
```

### Component Structure

```typescript
// ✅ Correct component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const router = useRouter()
  const [state, setState] = useState()

  // 2. Derived state
  const derivedValue = useMemo(() => {}, [])

  // 3. Effects
  useEffect(() => {}, [])

  // 4. Handlers
  const handleClick = () => {}

  // 5. Render
  return <div>...</div>
}
```

### Form Handling Pattern

```typescript
// ✅ Always use this pattern for forms
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  field: z.string().min(1, 'Required'),
})

function FormComponent() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { field: '' },
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Use Form components from packages/ui */}
    </form>
  )
}
```

### API Call Pattern

```typescript
// ✅ Use the API client from packages/api
import { api } from "@cf/api";

// Creating a new API endpoint integration:
// 1. Add types to packages/api/src/types/
// 2. Add method to appropriate service in packages/api/src/
// 3. Use the method in your component/page
// 4. Handle loading and error states

// In component
const { data, error, isLoading } = useQuery({
  queryKey: ["resource", id],
  queryFn: () => api.resource.get(id),
});

// API client features:
// - Base URL configured via NEXT_PUBLIC_API_BASE_URL
// - Automatic token injection for authenticated requests
// - Type-safe API methods with TypeScript
// - Error handling with proper logging
```

### Styling Guidelines

```tsx
// ✅ Use Tailwind classes with cn utility
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className, // Allow prop overrides
)} />

// ❌ Avoid inline styles
<div style={{ margin: '10px' }} />
```

### Error Handling

```typescript
// ✅ Comprehensive error handling
try {
  const result = await api.call();
  return result;
} catch (error) {
  // Log with context
  logger.error("Failed to fetch data", {
    error,
    context: { userId, action },
  });

  // User-friendly message
  toast.error(t("errors.generic"));

  // Re-throw if needed
  throw error;
}
```

### Testing Requirements

```typescript
// ✅ Test file naming
ComponentName.test.tsx  // Unit tests
ComponentName.spec.tsx  // Integration tests

// ✅ Test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { /* ... */ }

    // Act
    render(<ComponentName {...props} />)

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Performance Optimizations

1. **Use React.memo() for expensive components**
2. **Use useMemo() for expensive calculations**
3. **Use useCallback() for stable function references**
4. **Lazy load routes and heavy components**
5. **Optimize images with next/image**

### Security Best Practices

1. **Never expose sensitive data in client components**
2. **Validate all user inputs with Zod**
3. **Sanitize HTML content before rendering**
4. **Use environment variables for secrets**
5. **Implement proper CORS and CSP headers**

### Common Pitfalls to Avoid

❌ **DON'T:**

- Create new files unless absolutely necessary
- Add console.log statements (use logger instead)
- Use relative imports outside the module
- Mix client and server logic
- Hardcode strings (use i18n)
- Create duplicate utilities
- Use setTimeout for async operations
- Ignore TypeScript errors

✅ **DO:**

- Search for existing patterns first
- Use the established folder structure
- Follow the import order convention
- Handle loading and error states
- Use semantic HTML elements
- Test edge cases
- Clean up effects and subscriptions
- Document complex business logic (only when needed)

### Before Making Changes

1. **Search for similar implementations** using ast-grep or ripgrep
2. **Check if a utility already exists** in packages/
3. **Verify the component doesn't exist** in packages/ui
4. **Review related tests** to understand expected behavior
5. **Run type checking** before committing

### After Making Changes

Always run these commands:

```bash
bun run typecheck    # Ensure no TypeScript errors
bun run lint:fix     # Fix linting issues
bun run format:fix   # Fix formatting
bun run test         # Ensure tests pass
```

## Important Notes

### Current Limitations

- Client-side auth via Clerk limits React Server Component usage
- Some features require refactoring for server-side rendering
- Planning migration to server-side sessions

### Security Configuration

The Next.js app includes security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Limited permissions

### Dependency Version Management

This monorepo uses Syncpack to ensure consistent dependency versions:

- React ecosystem: Pinned to exact versions
- Next.js: Consistent versions across all apps
- Internal packages: Use workspace protocol (`workspace:*`)
- Other dependencies: Use caret ranges (`^`)

Run `bun run deps:check` before committing to ensure version consistency.

## Additional App-Specific Information

### Admin App

- Uses Headless UI components
- Tabler Icons for iconography
- Immer for immutable state updates
- Similar authentication setup to grower/buyer apps

### Grower App

- Includes MapBox integration for geospatial features
- React Virtual for virtualized lists
- Phone number input component for international support
- OpenAPI TypeScript codegen script: `bun run codegen`
- API endpoint: https://completefarmerapi-qa-f9g9bggnhdgdghf4.southafricanorth-01.azurewebsites.net

### Buyer App

- Parallel structure to Grower app
- Separate testing setup with coverage reports
- Vitest UI available for visual test debugging
- Port 3010 in development (to run alongside grower)

### Common Workflows

**Adding a new page**:

1. Create file in appropriate route under `app/[locale]/`
2. Use layout patterns from existing pages
3. Add translations to message files
4. Implement proper loading and error states

**Creating a new API endpoint integration**:

1. Add types to `packages/api/src/types/`
2. Add method to appropriate service in `packages/api/src/`
3. Use the method in your component/page
4. Handle loading and error states

**Adding a new UI component**:

1. Check if it exists in `packages/ui` first
2. Follow shadcn/ui patterns for new components
3. Export from `packages/ui/src/index.ts`
4. Document props with TypeScript

### Testing Configuration

- **Unit Tests**: Vitest with React Testing Library
  - Config: `vitest.config.ts` (multi-project setup for buyer/grower)
  - Buyer setup: `apps/buyer/src/test-setup.ts`
  - Run specific: `bun run test -- path/to/test.spec.ts`
  - Coverage: `bun run test:coverage`
  - UI mode: `bun run test:ui`
- **E2E Tests**: Playwright
  - Config: `playwright.config.ts`
  - Directory: `e2e/`
  - Browsers: Chrome, Firefox, Safari, Mobile Chrome/Safari (Pixel 5, iPhone 12)
  - Base URL: http://localhost:3000
  - Auto-starts dev server when running tests

### Code Style

- ESLint and Prettier are configured - run before committing
- Use conventional commits format: `type(scope): description`
- TypeScript strict mode is enabled
- Prefer functional components and hooks
- Husky pre-commit hooks run automatically

## 🚨 CRITICAL: Code Quality Standards

**Challenge poor practices!** If asked to:

- Add unnecessary comments → Refuse and explain why
- Create duplicate utilities → Point to existing ones
- Ignore TypeScript errors → Insist on fixing them
- Skip tests → Explain the importance of testing
- Use poor patterns → Suggest better alternatives

**Always prioritize:**

1. Code reusability over duplication
2. Type safety over quick fixes
3. Established patterns over new approaches
4. Performance over convenience
5. Security over functionality shortcuts

Remember: You're not just writing code, you're maintaining a production system used by farmers worldwide. Every line matters.

### Important

- Never use any as a type.
- Always use the correct type for the data.
- Always use the correct type for the function parameters.
- Always use the correct type for the function return type.
- Always use the correct type for the variable type.
- Always use the correct type for the constant type.
- Always use the correct type for the interface type.
- Always use the correct type for the enum type.

# When you need to call tools from the shell, **use this rubric**:

- Find Files: `fd`
- Find Text: `rg` (ripgrep)
- Find Code Structure (TS/TSX): `ast-grep`
  - **Default to TypeScript:**
    - `.ts` → `ast-grep --lang ts -p '<pattern>'`
    - `.tsx` (React) → `ast-grep --lang tsx -p '<pattern>'`
  - For other languages, set `--lang` appropriately (e.g., `--lang rust`).
- Select among matches: pipe to `fzf`
- JSON: `jq`
- YAML/XML: `yq`

If ast-grep is available avoid tools `rg` or `grep` unless a plain‑text search is explicitly requested.

## IMPORTANT: Search Tool Priority

When searching for code patterns, ALWAYS use this priority order:

1. **ast-grep** - Primary tool for structural code search (language-aware, AST-based)
2. **rg (ripgrep)** - Fallback if ast-grep is not available
3. **grep** - Only use if both ast-grep and rg are unavailable

## ast-grep Usage

ast-grep is a structural search tool that understands code syntax, not just text. It's much more accurate than text-based search.

### Basic Usage

```bash
# Search for pattern in current directory
ast-grep --pattern 'console.log($$$)'

# Search in specific file types
ast-grep --pattern 'useState($$$)' --lang tsx

# Search in specific directory
ast-grep --pattern 'import { $$ } from "react"' src/

# Multiple patterns (OR)
ast-grep --pattern 'console.log($$$$)' --pattern 'console.error($$$)'
```

### Pattern Syntax

- `$VAR` - Matches any single AST node (identifier, expression, etc.)
- `$$$` - Matches zero or more AST nodes (wildcard)
- `$$VAR` - Matches one or more AST nodes
- Use actual code syntax, not regex

### Common Patterns for React/TypeScript

```bash
# Find all useState hooks
ast-grep --pattern 'useState($$$)'

# Find all useEffect with dependencies
ast-grep --pattern 'useEffect($_, [$$$])'

# Find component definitions
ast-grep --pattern 'function $COMPONENT($$$) { $$$ }'
ast-grep --pattern 'const $COMPONENT = ($$$) => { $$$ }'

# Find all imports from a specific module
ast-grep --pattern 'import { $$$ } from "@/components/ui"'

# Find API calls
ast-grep --pattern 'axios.$METHOD($$$)'
ast-grep --pattern 'fetch($$$)'

# Find specific JSX elements
ast-grep --pattern '<Button $$$>$$$</Button>'

# Find async functions
ast-grep --pattern 'async function $NAME($$$) { $$$ }'
ast-grep --pattern 'async ($$$) => { $$$ }'

# Find try-catch blocks
ast-grep --pattern 'try { $$$ } catch ($ERR) { $$$ }'

# Find conditional renders
ast-grep --pattern '{$CONDITION && $JSX}'
ast-grep --pattern '{$CONDITION ? $TRUE : $FALSE}'

# Find Zod schemas
ast-grep --pattern 'z.object({ $$$ })'

# Find React Query hooks
ast-grep --pattern 'useQuery({ $$$ })'
ast-grep --pattern 'useMutation({ $$$ })'
```

### When to Use ast-grep vs Other Tools

**Use ast-grep for:**

- Finding function/method calls
- Finding specific code patterns
- Finding React hooks, components
- Finding imports/exports
- Any structural code search

**Use ripgrep (rg) for:**

- Text/string searches
- Comments
- Configuration files
- When ast-grep is unavailable

### Documentation Reference

For more complex patterns and detailed documentation, use:

```bash
# Fetch comprehensive ast-grep documentation
curl https://ast-grep.github.io/llms.txt
```

Or access the WebFetch tool with the URL: https://ast-grep.github.io/llms.txt
