# Testing Guide for Buyer App

This document provides comprehensive information about testing in the Buyer app, including how to run tests, what they cover, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

The Buyer app uses the following testing stack:

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for Node.js

### Prerequisites

Make sure you have all dependencies installed:

```bash
bun install
```

## Running Tests

### Run all tests
```bash
bun test
```

### Run tests in watch mode
```bash
bun test:watch
```

### Run tests with UI
```bash
bun test:ui
```

### Run tests with coverage
```bash
bun test:coverage
```

### Run specific test file
```bash
bun test login-form.test.tsx
```

### Run tests matching a pattern
```bash
bun test --run login
```

## Test Structure

```
src/
├── app/
│   └── [locale]/
│       └── (auth)/
│           └── sign-in/
│               ├── page.tsx
│               └── page.test.tsx          # Page component tests
├── components/
│   └── forms/
│       ├── login-form.tsx
│       └── login-form.test.tsx           # Component tests
├── lib/
│   └── schemas/
│       ├── sign-in.ts
│       └── sign-in.test.ts               # Schema validation tests
├── test-setup.ts                         # Global test setup
└── test-utils.tsx                        # Test utilities and helpers
```

## Test Coverage

### Current Test Coverage

#### 1. Login Form Logic (`login-form.simple.test.tsx`)
- ✅ Form validation (email format, password length)
- ✅ Authentication flow simulation
- ✅ Error handling patterns
- ✅ Navigation URL generation
- ✅ Form data processing
- ✅ Edge case handling

#### 2. Login Schema (`sign-in.test.ts`)
- ✅ Email validation (format, normalization, edge cases)
- ✅ Password validation (length, special characters)
- ✅ Complete form validation
- ✅ Type inference
- ✅ Error message handling

#### 3. Error Mapper (`error-mapper.test.ts`)
- ✅ SharedKernelError code mapping
- ✅ Clerk error code mapping
- ✅ HTTP status code mapping
- ✅ Error message extraction
- ✅ Network error handling
- ✅ Default error fallbacks

### Coverage Areas

| Component/Module | Test Coverage | Status |
|------------------|---------------|--------|
| Login Form Logic | 85% | ✅ Complete |
| Login Schema | 100% | ✅ Complete |
| Error Mapper | 91.66% | ✅ Complete |
| Test Utils | 100% | ✅ Complete |

## Writing Tests

### Test File Naming Convention

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utility.test.ts`
- Schema tests: `schema.test.ts`
- Page tests: `page.test.tsx`

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  describe('when condition', () => {
    it('should do something', async () => {
      // Arrange
      const user = userEvent.setup();
      
      // Act
      render(<Component />);
      
      // Assert
      expect(screen.getByText('Expected text')).toBeInTheDocument();
    });
  });
});
```

### Using Test Utilities

Import test utilities for common patterns:

```typescript
import { 
  render, 
  screen, 
  createMockUser, 
  createMockTranslations,
  fillLoginForm,
  submitLoginForm 
} from '@/test-utils';
```

### Mocking Dependencies

Use the provided mock setup in `test-setup.ts`:

```typescript
// Mock hooks
vi.mocked(useSignIn).mockReturnValue(mockUseSignIn());
vi.mocked(useAuth).mockReturnValue(mockUseAuth());

// Mock translations
vi.mocked(useTranslations).mockImplementation((namespace) => 
  createMockTranslations(namespace)
);
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Component Testing

- Test user interactions, not implementation details
- Use `data-testid` attributes for element selection
- Test accessibility features
- Mock external dependencies

### 3. Form Testing

- Test validation rules
- Test submission flows
- Test error states
- Test loading states

### 4. Async Testing

- Use `waitFor` for async operations
- Handle loading states properly
- Test error boundaries

### 5. Mocking

- Mock external services (Clerk, API calls)
- Mock navigation functions
- Mock translations
- Use consistent mock data

### Example Test Pattern

```typescript
describe('LoginForm', () => {
  const user = userEvent.setup();

  it('should handle successful login', async () => {
    // Arrange
    render(<LoginForm />);
    
    // Act
    await fillLoginForm(user);
    await submitLoginForm(user);
    
    // Assert
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/dashboard');
    });
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Test Environment Issues

**Problem**: Tests fail with DOM-related errors
**Solution**: Ensure `jsdom` is properly configured in `vitest.config.ts`

#### 2. Mock Issues

**Problem**: Mocks not working as expected
**Solution**: Check that mocks are set up in `test-setup.ts` or in individual test files

#### 3. Async Test Failures

**Problem**: Tests fail due to timing issues
**Solution**: Use `waitFor` for async operations and ensure proper cleanup

#### 4. Translation Issues

**Problem**: Translation keys not found
**Solution**: Ensure all translation keys are mocked in test utilities

### Debugging Tests

1. **Run tests in watch mode** to see real-time feedback
2. **Use `console.log`** for debugging (remember to remove before committing)
3. **Use `screen.debug()`** to see the rendered DOM
4. **Use `--reporter=verbose`** for detailed output

```bash
bun test --reporter=verbose
```

### Performance Tips

1. **Mock heavy dependencies** to speed up tests
2. **Use `beforeEach`** for common setup
3. **Clean up after tests** to prevent state leakage
4. **Run tests in parallel** when possible

## Continuous Integration

Tests are automatically run in CI/CD pipelines:

- **Pre-commit**: Basic test suite
- **Pull Request**: Full test suite with coverage
- **Main Branch**: Full test suite with coverage and performance checks

### Coverage Requirements

- **Minimum coverage**: 80%
- **Critical paths**: 95%
- **New features**: 90%

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed

### Adding New Tests

1. Create test file with `.test.tsx` or `.test.ts` extension
2. Follow the established patterns
3. Use provided test utilities
4. Add comprehensive coverage
5. Update this documentation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
