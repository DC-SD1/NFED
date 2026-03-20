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

### Utilities

- `bun run clean` - Clean all node_modules
- `bun run clean:workspaces` - Clean workspace build artifacts
- `bun run gen` - Run Turbo generators
- `bun run commit` - Create a commit with Commitizen
- `bun run release` - Create a new release with semantic-release

## 🔧 Configuration

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
