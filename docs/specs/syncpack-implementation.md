# Syncpack Implementation Specification

## Overview

Implement Syncpack to enforce consistent dependency versions across the CF monorepo, preventing version conflicts and ensuring all packages use the same versions of shared dependencies.

## Problem Statement

In a monorepo with multiple packages and applications, it's common to have:

- Different versions of the same dependency across packages
- Inconsistent version ranges (^, ~, exact versions)
- Duplicate dependencies with different versions
- Difficulty tracking which packages need updates

This leads to:

- Larger bundle sizes
- Potential runtime conflicts
- Increased maintenance burden
- Unpredictable behavior across packages

## Solution: Syncpack

Syncpack is a tool that:

- Identifies version mismatches across packages
- Automatically fixes version inconsistencies
- Enforces version policies
- Integrates with CI/CD pipelines

## Technical Requirements

### 1. Core Features to Implement

- **Version Synchronization**: Ensure all packages use the same version of shared dependencies
- **Version Policy Enforcement**: Define rules for version ranges (prefer exact, ^, or ~)
- **Workspace Protocol**: Support for workspace:\* protocol in monorepos
- **Semver Group Management**: Group dependencies by type (prod, dev, peer)
- **CI Integration**: Fail builds when versions are mismatched

### 2. Configuration Strategy

```json
{
  "source": ["package.json", "apps/*/package.json", "packages/*/package.json"],
  "versionGroups": [
    {
      "label": "Ensure React ecosystem versions are pinned",
      "dependencies": [
        "react",
        "react-dom",
        "@types/react",
        "@types/react-dom"
      ],
      "dependencyTypes": ["prod", "dev"],
      "pinVersion": true
    },
    {
      "label": "Ensure Next.js versions are consistent",
      "dependencies": ["next"],
      "dependencyTypes": ["prod"],
      "policy": "sameRange"
    },
    {
      "label": "Use workspace protocol for local packages",
      "dependencies": ["@cf/*"],
      "dependencyTypes": ["prod", "dev"],
      "policy": "workspace"
    }
  ],
  "semverGroups": [
    {
      "range": "^",
      "dependencyTypes": ["prod"],
      "dependencies": ["**"],
      "exclude": ["react", "react-dom", "next"]
    }
  ]
}
```

### 3. Integration Points

- **Package.json Scripts**: Add syncpack commands
- **Pre-commit Hooks**: Check version sync before commits
- **CI/CD Pipeline**: Validate versions in GitHub Actions
- **Developer Workflow**: IDE integration and CLI commands

## Implementation Plan

### Phase 1: Setup & Configuration (Week 1)

1. **Install Syncpack**

   ```bash
   bun add -d syncpack
   ```

2. **Create Configuration**

   - Add `.syncpackrc.json` to root
   - Define version groups based on current dependencies
   - Set up semver policies

3. **Audit Current State**
   - Run `syncpack list-mismatches`
   - Document all version conflicts
   - Create migration plan

### Phase 2: Version Alignment (Week 1-2)

1. **Fix Critical Dependencies**

   - React/React-DOM versions
   - Next.js versions
   - TypeScript versions
   - Build tool versions

2. **Align Shared Dependencies**

   - UI library dependencies
   - Testing frameworks
   - Linting/formatting tools
   - Utility libraries

3. **Update Workspace Dependencies**
   - Convert to workspace:\* protocol
   - Ensure all @cf/\* packages use workspace protocol

### Phase 3: Automation & CI (Week 2)

1. **Add Package Scripts**

   ```json
   {
     "scripts": {
       "syncpack:check": "syncpack list-mismatches",
       "syncpack:fix": "syncpack fix-mismatches",
       "syncpack:format": "syncpack format",
       "syncpack:lint": "syncpack lint-semver-ranges"
     }
   }
   ```

2. **Git Hooks Integration**

   - Add to existing pre-commit hooks
   - Run `syncpack:check` before commits

3. **CI/CD Integration**
   - Add GitHub Action workflow
   - Fail builds on version mismatches
   - Generate reports for PRs

### Phase 4: Documentation & Training (Week 2-3)

1. **Developer Documentation**

   - How to add new dependencies
   - How to update existing dependencies
   - Common syncpack commands
   - Troubleshooting guide

2. **Team Training**
   - Walkthrough of syncpack benefits
   - Demo of common workflows
   - Best practices for dependency management

## Technical Specifications

### 1. Syncpack Configuration File

Location: `/.syncpackrc.json`

```json
{
  "$schema": "https://unpkg.com/syncpack@latest/dist/schema.json",
  "source": [
    "package.json",
    "apps/*/package.json",
    "packages/*/package.json",
    "tooling/*/package.json"
  ],
  "versionGroups": [
    {
      "label": "Pin React ecosystem",
      "dependencies": [
        "react",
        "react-dom",
        "@types/react",
        "@types/react-dom"
      ],
      "pinVersion": true
    },
    {
      "label": "Consistent Next.js",
      "dependencies": ["next", "@next/*"],
      "policy": "sameRange"
    },
    {
      "label": "Workspace packages",
      "dependencies": ["@cf/*"],
      "policy": "workspace"
    },
    {
      "label": "Testing tools",
      "dependencies": ["vitest", "@vitest/*", "playwright", "@playwright/*"],
      "dependencyTypes": ["dev"],
      "policy": "sameRange"
    },
    {
      "label": "Linting and formatting",
      "dependencies": [
        "eslint",
        "eslint-*",
        "prettier",
        "@typescript-eslint/*"
      ],
      "dependencyTypes": ["dev"],
      "policy": "sameRange"
    }
  ],
  "semverGroups": [
    {
      "label": "Prefer caret ranges",
      "range": "^",
      "dependencyTypes": ["prod"],
      "dependencies": ["**"],
      "exclude": ["react", "react-dom", "@types/react", "@types/react-dom"]
    }
  ],
  "sortFirst": ["name", "description", "version", "private"],
  "sortAz": [
    "contributors",
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "resolutions"
  ]
}
```

### 2. GitHub Action Workflow

Location: `/.github/workflows/syncpack.yml`

```yaml
name: Syncpack Version Check

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main, qa, develop]

jobs:
  syncpack:
    name: Check dependency versions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Check version mismatches
        run: bun run syncpack:check

      - name: Check semver ranges
        run: bun run syncpack:lint

      - name: Generate mismatch report
        if: failure()
        run: |
          echo "## ❌ Dependency Version Mismatches Found" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Run \`bun run syncpack:fix\` locally to fix these issues." >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          bun run syncpack list-mismatches >> $GITHUB_STEP_SUMMARY 2>&1 || true
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
```

### 3. Pre-commit Hook

Update existing git hooks or add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for dependency version mismatches
echo "Checking dependency versions..."
bun run syncpack:check || {
  echo "❌ Dependency version mismatches found!"
  echo "Run 'bun run syncpack:fix' to fix them."
  exit 1
}
```

### 4. Developer Scripts

Add to root `package.json`:

```json
{
  "scripts": {
    "deps:check": "syncpack list-mismatches",
    "deps:fix": "syncpack fix-mismatches && syncpack format",
    "deps:lint": "syncpack lint-semver-ranges",
    "deps:update": "syncpack update && bun install",
    "deps:list": "syncpack list",
    "postinstall": "syncpack list-mismatches --skip-invalid"
  }
}
```

## Success Criteria

1. **Zero Version Mismatches**: All shared dependencies use identical versions
2. **Consistent Semver Ranges**: All packages follow the same versioning strategy
3. **CI/CD Integration**: Automated checks prevent mismatches from being merged
4. **Developer Adoption**: Team actively uses syncpack commands
5. **Reduced Bundle Size**: Elimination of duplicate dependency versions

## Migration Strategy

### Step 1: Baseline Assessment

```bash
# Current state analysis
bun run syncpack list-mismatches > mismatches-baseline.txt
bun run syncpack list > dependencies-baseline.txt
```

### Step 2: Gradual Migration

1. Fix React ecosystem first (highest impact)
2. Align build tools (TypeScript, bundlers)
3. Standardize utility libraries
4. Update internal packages to workspace protocol

### Step 3: Enforcement

1. Enable warnings in CI (non-blocking)
2. Monitor and fix issues for 1 week
3. Make CI checks blocking
4. Add to merge requirements

## Risk Mitigation

1. **Breaking Changes**: Test each fix in development before applying
2. **Version Conflicts**: Use resolutions/overrides for incompatible peer deps
3. **Performance Impact**: Minimal - only affects install/build time
4. **Learning Curve**: Provide clear documentation and examples

## Rollback Plan

If issues arise:

1. Remove syncpack from CI checks
2. Keep tool installed for voluntary use
3. Gradually reintroduce after addressing concerns

## Future Enhancements

1. **Custom Plugins**: Write syncpack plugins for CF-specific rules
2. **Automated Updates**: Bot to create PRs for dependency updates
3. **Security Integration**: Combine with security scanning
4. **Version Policies**: Define policies for major version updates
5. **Monorepo Optimization**: Use syncpack to optimize workspace hoisting

## References

- [Syncpack Documentation](https://jamiemason.github.io/syncpack/)
- [Syncpack Configuration](https://jamiemason.github.io/syncpack/config/syncpackrc/)
- [Turborepo Handbook - Managing Dependencies](https://turbo.build/repo/docs/handbook/package-installation)
