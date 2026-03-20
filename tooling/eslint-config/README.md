# @cf/eslint-config

Shared ESLint configuration for the CF monorepo.

## Configurations

### base.js
Core ESLint configuration with TypeScript support and common rules.

**Features:**
- TypeScript type checking
- Unused imports auto-removal
- Import sorting
- Type imports enforcement
- Code quality rules (max params, max lines per function)
- Circular dependency detection

### react.js
React-specific linting rules.

**Features:**
- React hooks rules
- JSX accessibility
- React best practices

### nextjs.js
Next.js specific rules for App Router and Pages Router.

### tailwind.js
Tailwind CSS class ordering and validation.

**Features:**
- Automatic class ordering (matches official Prettier plugin)
- Custom class support for CSS modules
- Configurable class detection

## Usage

In your `package.json`:

```json
{
  "eslintConfig": {
    "root": true,
    "extends": [
      "@cf/eslint-config/base",
      "@cf/eslint-config/react",
      "@cf/eslint-config/nextjs",
      "@cf/eslint-config/tailwind"
    ]
  }
}
```

## Auto-fixing

Many rules support auto-fixing. Run with `--fix` flag:

```bash
npm run lint -- --fix
# or
bun run lint --fix
```

### Auto-fixable Rules

1. **Unused Imports** - Automatically removes unused imports
2. **Import Sorting** - Sorts imports alphabetically and by type
3. **Type Imports** - Converts regular imports to type imports where applicable
4. **Tailwind Classes** - Orders classes according to official sorting

## Rule Customization

You can override any rules in your app's eslintConfig:

```json
{
  "eslintConfig": {
    "extends": ["@cf/eslint-config/base"],
    "rules": {
      "max-lines-per-function": ["error", 300],
      "max-params": "off"
    }
  }
}
```

## Development

To add new plugins:

1. Add to `package.json` dependencies
2. Update the appropriate config file
3. Document the changes here
4. Run `bun install` at the monorepo root