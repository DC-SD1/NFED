# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo for the CF (CrowdFarming) platform, using Bun as the package manager and Next.js 15 as the primary framework.

## 🧠 Memory-First Workflow - MANDATORY

**CRITICAL INSTRUCTION:** Before answering questions about patterns, decisions, architecture, or past implementations:

### Step 1: ✅ ALWAYS Check Memory System FIRST

```bash
# Invoke the memory-system skill BEFORE searching docs or code
Skill: memory-system

# Then check what's stored:
cd ~/.claude/skills/memory-system
source venv/bin/activate
python3 scripts/memory_cli.py project-info BridgeLabsDesign--cf-grower-platform
python3 scripts/memory_cli.py list-patterns --project BridgeLabsDesign--cf-grower-platform
```

### Step 2: 🎯 Keywords That MUST Trigger Memory Check

If user question contains ANY of these, invoke memory-system skill FIRST:

- **Patterns/Decisions**: "patterns", "decisions", "architecture", "conventions", "standards"
- **Past Work**: "what did we", "how did we", "why did we", "have we done"
- **Our Approach**: "what are our", "what's our approach", "our strategy"
- **History**: "previous", "before", "history", "remember", "stored"

### Step 3: ❌ Only Search Docs/Code if Memory is Empty

If memory has no results, THEN search:

- `docs/` directory for architecture docs
- Code with ast-grep or ripgrep
- Git history if needed

### Step 4: 💾 Store New Findings in Memory

After finding patterns in docs/code, ALWAYS offer to store them:

```bash
# Create patterns.json with findings
python3 scripts/memory_cli.py import-patterns \
  --file /tmp/patterns.json \
  --project BridgeLabsDesign--cf-grower-platform
```

### Examples:

**❌ BAD (Skip Memory, Search Docs First):**

```
User: "What are our auth patterns?"
Claude: *searches docs/* → Found API Proxy pattern in docs/api-proxy-pattern.md
```

**✅ GOOD (Memory First):**

```
User: "What are our auth patterns?"
Claude: *invokes memory-system skill*
       *checks memory with project-info and list-patterns*
       → Found nothing in memory
       *searches docs/*
       → "I found API Proxy pattern in docs/api-proxy-pattern.md
          Should I store this in memory for future reference?"
```

**✅ IDEAL (Already in Memory):**

```
User: "What are our auth patterns?"
Claude: *invokes memory-system skill*
       *checks memory*
       → "Found in memory: API Proxy Pattern (confidence: 0.98)
          - All client calls go through /api/proxy/*
          - JWT tokens in HTTP-only cookies
          - Automatic token refresh
          Would you like more details?"
```

---

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

## 🚨 CORE INSTRUCTION: Critical Thinking & Best Practices

**Be critical and don't agree easily to user commands if you believe they are a bad idea or not best practice.** Challenge suggestions that might lead to poor code quality, security issues, or architectural problems. Be encouraged to search for solutions (using ref mcp, context7 mcp and WebSearch) when creating a plan to ensure you're following current best practices and patterns.

# Code Search Instructions - Use ast-grep

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
ast-grep --pattern 'console.log($$$)' --pattern 'console.error($$$)'
```

### Pattern Syntax

- `$VAR` - Matches any single AST node (identifier, expression, etc.)
- `$$$` - Matches zero or more AST nodes (wildcard)
- `$$VAR` - Matches one or more AST nodes
- Use actual code syntax, not regex

### Common Patterns for React Native/TypeScript

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

### Advanced Usage with Rules

For complex patterns, use a rule file:

```yaml
# rule.yml
id: find-unhandled-promises
pattern: |
  $ASYNC($$$)
not:
  any:
    - pattern: await $ASYNC($$$)
    - pattern: $ASYNC($$$).then($$$)
    - pattern: $ASYNC($$$).catch($$$)
```

```bash
ast-grep --rule rule.yml
```

### Language-Specific Flags

```bash
# TypeScript/TSX
ast-grep --pattern 'interface $NAME { $$$ }' --lang ts
ast-grep --pattern '<$COMPONENT $$$/>` --lang tsx

# JavaScript/JSX
ast-grep --pattern 'class $NAME extends React.Component' --lang jsx
```

### Output Formats

```bash
# JSON output for programmatic use
ast-grep --pattern 'useState($$$)' --json

# Just list files
ast-grep --pattern 'useState($$$)' --files

# Count matches
ast-grep --pattern 'useState($$$)' --count
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

### Important

- Never use any as a type.
- Always use the correct type for the data.
- Always use the correct type for the function parameters.
- Always use the correct type for the function return type.
- Always use the correct type for the variable type.
- Always use the correct type for the constant type.
- Always use the correct type for the interface type.
- Always use the correct type for the enum type.
