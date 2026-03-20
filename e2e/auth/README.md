# Authentication E2E Tests

This directory contains comprehensive end-to-end tests for the authentication system.

## Test Coverage

### 1. Sign-Up Flow (`signup.spec.ts`)
- Complete multi-step sign-up process
- Email validation and duplicate checking
- Password requirements validation
- OTP verification and retry mechanism
- Backend registration with retry on failure
- Data persistence across page refreshes

### 2. Sign-In Flow (`signin.spec.ts`)
- Successful authentication with role-based redirect
- Invalid credentials handling
- Rate limiting
- Form validation
- Password visibility toggle
- Navigation between auth pages

### 3. Token Management (`token-management.spec.ts`)
- Automatic token refresh on expiration
- Concurrent API calls during refresh (no race conditions)
- Token refresh failure handling
- Token persistence across page refreshes
- Logout and token revocation
- Protected route access control

### 4. Role-Based Access (`role-based-access.spec.ts`)
- Role-specific UI and route access
- Role metadata synchronization
- Default access for users without roles
- Role changes after re-authentication
- API authorization headers
- Route permission enforcement

## Running the Tests

### Prerequisites

1. Set up test environment variables:
```bash
cp .env.example .env.test
# Update with test Clerk instance and API URLs
```

2. Install dependencies:
```bash
bun install
```

3. Install Playwright browsers:
```bash
bunx playwright install
```

### Running Tests

```bash
# Run all auth tests
bun test:e2e e2e/auth

# Run specific test file
bun test:e2e e2e/auth/signup.spec.ts

# Run in UI mode for debugging
bun test:e2e:ui e2e/auth

# Run with specific browser
bun test:e2e e2e/auth --project=chromium

# Run in headed mode to see browser
bun test:e2e e2e/auth --headed

# Run with debug mode
bun test:e2e e2e/auth --debug
```

### Test Data Setup

The tests use mock data and API responses. For tests against a real backend:

1. Create test users in your test Clerk instance
2. Update `TEST_USERS` in `helpers/test-data.ts`
3. Ensure test API server has corresponding users
4. Configure test database to reset between runs

### Writing New Tests

1. Create new test file in this directory
2. Import `AuthHelpers` for common auth operations
3. Use test data generators from `helpers/test-data.ts`
4. Follow existing patterns for consistency

Example:
```typescript
import { test, expect } from '@playwright/test';
import { AuthHelpers } from './helpers/auth-helpers';

test.describe('New Auth Feature', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test('new feature works correctly', async ({ page }) => {
    // Your test implementation
  });
});
```

### Debugging Failed Tests

1. Use `--debug` flag to step through tests
2. Add `await page.pause()` to pause execution
3. Check screenshots in `test-results/` directory
4. Review trace files with `bunx playwright show-trace`
5. Use `console.log` in page.evaluate for browser logs

### CI/CD Integration

These tests should run:
- On every pull request
- Before deployments to staging
- As smoke tests after production deployments

GitHub Actions example:
```yaml
- name: Run Auth E2E Tests
  run: |
    bunx playwright install --with-deps
    bun test:e2e e2e/auth
```

## Maintenance

- Update test data when auth flow changes
- Add new tests for new features
- Keep mocks in sync with API changes
- Review and update error scenarios
- Monitor test execution time

## Known Limitations

1. OTP verification uses mock codes in tests
2. Some Clerk features may need real instance for full testing
3. Rate limiting tests may need adjustment based on Clerk settings
4. Role sync timing may vary in real environment