# ESLint v9 Migration Investigation - October 2025

## Executive Summary

**Decision: POSTPONE migration to ESLint v9 until Next.js fully supports flat config**

**Current State:**

- ESLint: v8.57.1 (working)
- eslint-config-turbo: v1.13.4 (working)
- Configuration: Legacy .eslintrc format

**Target State (blocked):**

- ESLint: v9.15.0+
- eslint-config-turbo: v2.5.5
- Configuration: Flat config (eslint.config.js)

## Investigation Timeline

**Date:** October 26, 2025
**Branch:** feature/eslint-v9-migration (preserved in backup/eslint-v8-config)
**Outcome:** Migration postponed due to Next.js compatibility issues

## Key Findings

### 1. Next.js Flat Config Support

**Issue:** Next.js 15's `next lint` command does not fully support ESLint v9's flat config format.

**Error Encountered:**

```
@cf/grower:lint: $ next lint
@cf/grower:lint: Invalid Options:
```

**Root Cause:** While Next.js 15.3.3 is available, the `next lint` command still expects traditional ESLint configuration formats.

### 2. Module Type Conflicts

**Issue:** Adding `"type": "module"` to eslint-config package breaks backward compatibility.

**Details:**

- Flat config requires ES modules (`"type": "module"`)
- Existing `base.js` uses CommonJS (`module.exports`)
- Creates conflicts for packages still using legacy config

**Error Encountered:**

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './base' is not defined by "exports"
```

### 3. Plugin Compatibility

**Successfully Validated:**
All required plugins have ESLint v9 compatible versions:

| Plugin                       | Current | ESLint v9 Compatible |
| ---------------------------- | ------- | -------------------- |
| eslint                       | 8.57.1  | 9.15.0+ ✅           |
| @typescript-eslint/plugin    | 7.5.0   | 8.15.0+ ✅           |
| @typescript-eslint/parser    | 7.5.0   | 8.15.0+ ✅           |
| eslint-plugin-import         | 2.29.1  | 2.31.0+ ✅           |
| eslint-plugin-unused-imports | 3.1.0   | 4.1.4+ ✅            |
| eslint-plugin-react          | 7.34.1  | 7.37.2+ ✅           |
| eslint-plugin-react-hooks    | 4.6.0   | 5.0.0+ ✅            |
| @next/eslint-plugin-next     | 14.0.1  | 15.3.3+ ✅           |
| eslint-config-turbo          | 1.13.4  | 2.5.5+ ✅            |

### 4. Configuration Structure Created

**Flat Config Structure (tested but not deployed):**

```javascript
// tooling/eslint-config/eslint.config.js
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
// ... other imports

export default [
  // Global ignores
  { ignores: ['**/node_modules/**', '**/.next/**', ...] },

  // Base ESLint recommended
  js.configs.recommended,

  // TypeScript and plugin configuration
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: { parser: typescriptParser, ... },
    plugins: { '@typescript-eslint': typescript, ... },
    rules: { /* all existing rules mapped */ }
  }
];
```

**App-Specific Config (grower):**

```javascript
// apps/grower/eslint.config.js
import baseConfig from '@cf/eslint-config/eslint.config.js';
import reactPlugin from 'eslint-plugin-react';
// ... other Next.js/React plugins

export default [
  ...baseConfig,
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: reactPlugin, ... },
    rules: { /* React/Next.js specific rules */ }
  }
];
```

## Migration Blockers

### Primary Blocker: Next.js Support

**Status:** Next.js does not fully support ESLint v9 flat config as of v15.3.3

**Impact:** Cannot use `next lint` with flat config, which is core to our development workflow

**Tracking:**

- Next.js Issue: TBD (need to verify if issue exists)
- Expected timeline: Unknown

### Secondary Concerns

1. **Monorepo Complexity:** 14 packages would need simultaneous migration
2. **Team Disruption:** All developers would need to update their workflows
3. **CI/CD Impact:** All lint pipelines would need validation
4. **Rollback Complexity:** Reverting would affect all packages

## Recommended Actions

### Immediate (Completed)

- [x] Stay on ESLint v8.57.1
- [x] Keep eslint-config-turbo at v1.13.4
- [x] Document investigation findings
- [x] Preserve migration work in backup branch

### Short Term (Next 3 months)

- [ ] Monitor Next.js releases for flat config support
- [ ] Track eslint-config-turbo security updates
- [ ] Review quarterly for migration readiness

### Long Term (Q1 2026)

- [ ] Re-evaluate migration when Next.js supports flat config
- [ ] Update migration plan based on ecosystem changes
- [ ] Consider hybrid approach if needed

## Alternative Solutions Considered

### Option A: Wait for Next.js Support (CHOSEN)

**Pros:**

- No risk to current workflow
- Clean migration path when ready
- Ecosystem will be more stable

**Cons:**

- Delayed access to ESLint v9 features
- Staying on older tooling

### Option B: Hybrid Approach

**Pros:**

- Partial migration possible
- Could migrate non-Next.js packages

**Cons:**

- Complex to maintain dual configs
- High maintenance burden
- Team confusion

### Option C: Full Migration

**Pros:**

- Latest tooling immediately
- Clean state

**Cons:**

- Breaks Next.js integration
- High risk
- Team disruption

## Technical Debt

**Debt Item:** ESLint v8 + turbo v1.13.4 (Legacy Config)

**Risk Level:** Low

- Current setup is stable
- Security updates still available
- No immediate pressure to upgrade

**Mitigation:**

- Monitor for security advisories
- Track Next.js flat config support
- Preserve migration branch for future use

## October 26, 2025 Update: Turbo Plugin Fix

**Issue:** `eslint-plugin-turbo@1.13.4` fails with "Cannot convert undefined or null to object" error when running lint from `tooling/eslint-config` package.

**Root Cause:** The plugin's `generateKey()` method tries to find the workspace root (turbo.json location) but fails when ESLint runs from a sub-package deep in the monorepo structure. The plugin crashes during initialization even if its rules are disabled.

**Solution Implemented:**

- Removed `"turbo"` from the `extends` array in `tooling/eslint-config/base.js`
- Removed turbo plugin from the base config entirely
- Added explanatory comment noting workspace detection issues
- Individual apps can still use turbo linting by extending `eslint-config-turbo` directly in their own configs

**Result:** ESLint now works correctly across all packages without the turbo plugin crash.

**Files Modified:**

- `tooling/eslint-config/base.js` - Removed turbo from extends and plugins

**Why This is Better Than Upgrading:**

- Avoids forcing ESLint v9 migration before Next.js supports it
- Keeps working ESLint v8 setup stable
- Turbo linting still available where needed (app-level configs)
- No loss of functionality for our use case

## Resources

**Branches:**

- `backup/eslint-v8-config` - Snapshot before migration attempt
- `feature/eslint-v9-migration` - Migration work (not deployed)

**Documentation:**

- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

## Review Schedule

**Next Review:** Q1 2026 (January 2026)

**Triggers for Earlier Review:**

- Next.js announces flat config support
- Security vulnerability in ESLint v8
- eslint-config-turbo v1.x reaches EOL

---

**Last Updated:** October 26, 2025
**Author:** Claude Code Migration Investigation
**Status:** Investigation Complete - Migration Postponed
