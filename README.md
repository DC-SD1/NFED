# CF Monorepo Development Guide

## Overview

This monorepo contains all Complete Farmer applications and packages, managed with Turborepo and Bun.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun 1.1.10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cf-monorepo

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local
cp apps/grower/.env.example apps/grower/.env.local
cp apps/auth-proxy/.env.example apps/auth-proxy/.env.local

# Run development
bun run dev
```

## 📁 Project Structure

```
cf-monorepo/
├── apps/
│   ├── grower/          # Main grower application (Next.js)
│   └── auth-proxy/      # Authentication proxy service
├── packages/
│   ├── ui/              # Shared UI components
│   ├── api/             # API client and utilities
│   ├── auth/            # Authentication utilities
│   ├── common/          # Common utilities and types
│   └── logger/          # Structured logging with Pino.js
├── tooling/
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── prettier-config/ # Shared Prettier configuration
│   ├── tailwind-config/ # Shared Tailwind configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── e2e/                 # End-to-end tests
└── test/                # Test utilities and setup
```

## 🛠️ Available Scripts

### Development

- `bun run dev` - Start all apps in development mode
- `bun run dev:web` - Start web apps only

### Building

- `bun run build` - Build all apps and packages
- `bun run analyze` - Analyze bundle sizes

### Code Quality

- `bun run lint` - Lint all files
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Check code formatting
- `bun run format:fix` - Fix formatting issues
- `bun run typecheck` - Run TypeScript type checking

### Testing

- `bun run test` - Run unit tests
- `bun run test:ui` - Run tests with UI
- `bun run test:coverage` - Run tests with coverage
- `bun run test:e2e` - Run E2E tests
- `bun run test:e2e:ui` - Run E2E tests with UI

### Dependency Management

- `bun run deps:check` - Check for version mismatches across the monorepo
- `bun run deps:fix` - Fix version mismatches automatically
- `bun run deps:list` - List all dependencies and their versions
- `bun run deps:update` - Update dependencies interactively
- `bun run deps:lint` - Check semver range policies

### Utilities

- `bun run clean` - Clean all node_modules
- `bun run clean:workspaces` - Clean workspace build artifacts
- `bun run gen` - Run Turbo generators
- `bun run commit` - Create a commit with Commitizen
- `bun run release` - Create a new release with semantic-release

## 🔧 Configuration

### Dependency Version Management (Syncpack)

This monorepo uses Syncpack to ensure consistent dependency versions across all packages. The configuration:

- **React ecosystem**: Pinned to exact versions to prevent version mismatches
- **Next.js**: Consistent versions across all apps
- **Internal packages**: Use workspace protocol (`workspace:*`)
- **Other dependencies**: Use caret ranges (`^`) for flexibility

#### Syncpack Commands Explained

**1. Check for Version Mismatches**

```bash
bun run deps:check
```

- Scans all package.json files in the monorepo
- Identifies packages with different versions across workspaces
- Shows which packages need to be synchronized
- Use this before committing to ensure consistency

**2. Fix Version Mismatches**

```bash
bun run deps:fix
```

- Automatically fixes all version mismatches
- Updates packages to use the highest version found
- Formats package.json files according to configuration
- Run `bun install` after fixing to update lockfile

**3. List All Dependencies**

```bash
bun run deps:list
```

- Shows all dependencies across the entire monorepo
- Groups packages by version
- Useful for auditing what versions are in use
- Helps identify duplicate or outdated packages

**4. Update Dependencies Interactively**

```bash
bun run deps:update
```

- Interactive tool to update dependencies
- Shows available updates for each package
- Allows selective updating of packages
- Maintains version consistency across workspaces

**5. Lint Semver Ranges**

```bash
bun run deps:lint
```

- Validates that version ranges follow configured policies
- Ensures React packages are pinned (no ^ or ~)
- Checks that internal packages use workspace protocol
- Verifies other packages use caret ranges (^)

#### Common Workflows

**Adding a New Dependency:**

```bash
# 1. Add to your package
cd apps/grower
bun add lodash

# 2. Check for mismatches
bun run deps:check

# 3. Fix if needed
bun run deps:fix

# 4. Install to update lockfile
bun install
```

**Updating an Existing Dependency:**

```bash
# 1. Update in one package
cd packages/ui
bun add react@latest

# 2. Sync across all packages
bun run deps:fix

# 3. Verify and install
bun install
```

**CI/CD Integration:**

- GitHub Actions automatically check for mismatches on PRs
- Builds will fail if versions are not synchronized
- Run `bun run deps:fix` locally to resolve CI failures

#### Pre-commit Hooks

The pre-commit hook automatically runs Syncpack checks when you commit changes to any `package.json` file:

1. **Automatic Checks**: When committing package.json changes, the hook will:

   - Check for version mismatches
   - Validate semver range policies
   - Prevent commits if issues are found

2. **Performance Optimized**: The hook only runs when package.json files are modified

   - Minimal impact on commit speed
   - Skipped entirely for non-dependency changes

3. **Emergency Bypass**: If you need to commit urgently:
   ```bash
   git commit --no-verify -m "Emergency commit message"
   ```
   ⚠️ **Use sparingly** - Always fix version issues afterward

### Git Hooks (Husky)

Pre-commit and commit-msg hooks are configured to ensure code quality:

- **Pre-commit**: Runs lint-staged on changed files
- **Commit-msg**: Validates commit messages with commitlint

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Scopes: `grower`, `auth-proxy`, `api`, `ui`, `auth`, `common`, `logger`, `eslint-config`, `prettier-config`, `tailwind-config`, `typescript-config`, `deps`, `repo`

#### Using Commitizen

For guided commit message creation:

```bash
bun run commit
```

This will prompt you through creating a properly formatted commit message.

### Testing

#### Unit Tests (Vitest)

- Configuration: `vitest.config.ts`
- Setup file: `test/setup.ts`
- Run with: `bun run test`

#### E2E Tests (Playwright)

- Configuration: `playwright.config.ts`
- Test directory: `e2e/`
- Run with: `bun run test:e2e`

### Monitoring

#### PostHog Analytics

- Already integrated in the grower app
- Configuration in `apps/grower/src/config/providers.tsx`

#### Sentry Error Monitoring

- Configuration files:
  - `apps/grower/sentry.client.config.ts`
  - `apps/grower/sentry.server.config.ts`
  - `apps/grower/sentry.edge.config.ts`
- Environment variables needed:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN`

### Logging

#### Structured Logging with Pino.js

The `@cf/logger` package provides structured logging for all applications:

```typescript
import { logger } from "@cf/logger/node";

// Basic logging
logger.info("User logged in", { userId: "123" });
logger.error(new Error("Something went wrong"), { context: "api" });

// Module-specific logger
const apiLogger = logger.child({ module: "api" });
apiLogger.debug("API request", { method: "GET", path: "/users" });
```

Features:

- Automatic pretty-printing in development
- JSON output in production
- Better Stack integration for log management
- Request ID tracking
- Sensitive data redaction

Environment variables:

- `BETTER_STACK_TOKEN` - For production log shipping to Better Stack

### SEO

#### Features Implemented:

- Dynamic sitemap generation (`apps/grower/src/app/sitemap.ts`)
- SEO utilities (`apps/grower/src/lib/seo.ts`)
- Robots.txt configuration
- OpenGraph and Twitter meta tags
- Structured data support (JSON-LD)

### Security

#### Headers Configured:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Limited permissions

## 🔍 VS Code Integration

### Workspace

Open `cf-monorepo.code-workspace` for the best development experience.

### Recommended Extensions

See `.vscode/extensions.json` for the full list of recommended extensions.

### Debugging

Multiple debug configurations are available in `.vscode/launch.json`:

- Next.js server-side debugging
- Next.js client-side debugging
- Full stack debugging
- Vitest test debugging
- Playwright test debugging

## 🚀 CI/CD

### GitHub Actions

The CI pipeline (`.github/workflows/ci.yml`) runs:

1. Linting and formatting checks
2. TypeScript type checking
3. Unit tests with coverage
4. Build verification
5. E2E tests
6. Automated releases with semantic-release (on main branch)

### Semantic Release

Automated versioning and changelog generation based on commit messages:

- Runs on push to main branch
- Creates GitHub releases
- Updates CHANGELOG.md
- No NPM publishing (monorepo internal packages)

### Dependabot

Configured to check for dependency updates weekly.

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Commit with conventional commits
5. Create a pull request

See `.github/pull_request_template.md` for PR guidelines.

## 🐛 Troubleshooting

### Common Issues

1. **Husky hooks not running**

   ```bash
   bunx husky init
   ```

2. **Playwright browsers not installed**

   ```bash
   bunx playwright install --with-deps
   ```

3. **Build errors**
   ```bash
   bun run clean
   bun install
   ```

## 📚 Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
