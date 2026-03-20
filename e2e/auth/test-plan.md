# Authentication E2E Test Plan

## Overview
This document outlines the comprehensive end-to-end testing strategy for the authentication system, focusing on the integration with Clerk, openapi-fetch client, and SharedKernelError handling.

## Test Environment Setup

### Prerequisites
1. **Test Clerk Instance**: Separate Clerk application for testing
2. **Test API Server**: Backend API with test database
3. **Test Data**:
   - Valid test user accounts
   - Test phone numbers for SMS verification
   - Test email addresses for OTP verification

### Environment Variables
```bash
# .env.test
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<test-clerk-key>
CLERK_SECRET_KEY=<test-clerk-secret>
NEXT_PUBLIC_API_URL=<test-api-url>
```

## Core Test Cases

### 1. New User Sign-Up Flow

#### Test Case 1.1: Complete Sign-Up Success Path
- **Objective**: Verify successful multi-step sign-up flow
- **Steps**:
  1. Navigate to `/sign-up`
  2. Fill basic info form (firstName, lastName, email, phone)
  3. Create password meeting all requirements
  4. Verify OTP sent to email
  5. Enter correct OTP code
  6. Complete marketing attribution
  7. Complete farming experience selection
  8. Verify redirect to dashboard
- **Expected Results**:
  - User created in Clerk
  - User registered in backend via openapi-fetch
  - Clerk metadata updated with role
  - Session established
  - Correct redirect based on farming experience

#### Test Case 1.2: Sign-Up with Existing Email
- **Objective**: Verify error handling for duplicate email
- **Steps**:
  1. Attempt sign-up with existing email
  2. Complete basic info form
  3. Create password
- **Expected Results**:
  - Clerk returns error
  - SharedKernelError structure parsed correctly
  - Localized error message displayed
  - User remains on password page

#### Test Case 1.3: Sign-Up with Invalid OTP
- **Objective**: Verify OTP validation and retry mechanism
- **Steps**:
  1. Complete basic info and password
  2. Enter incorrect OTP
  3. Retry with correct OTP
- **Expected Results**:
  - Error message for invalid OTP
  - Retry option available
  - Success on correct OTP entry

#### Test Case 1.4: Backend Registration Failure
- **Objective**: Verify handling when Clerk succeeds but backend fails
- **Steps**:
  1. Complete sign-up through OTP verification
  2. Simulate backend API failure
- **Expected Results**:
  - Retry mechanism displayed
  - User can retry registration
  - No redirect until backend succeeds

### 2. Existing User Sign-In Flow

#### Test Case 2.1: Successful Sign-In
- **Objective**: Verify standard sign-in flow
- **Steps**:
  1. Navigate to `/sign-in`
  2. Enter valid email
  3. Enter valid password
  4. Submit form
- **Expected Results**:
  - Clerk authentication successful
  - Token exchange performed
  - openapi-fetch client configured with token
  - Redirect to dashboard
  - Role-based access enforced

#### Test Case 2.2: Sign-In with Invalid Credentials
- **Objective**: Verify error handling for invalid credentials
- **Steps**:
  1. Enter valid email, invalid password
  2. Enter invalid email format
  3. Enter non-existent email
- **Expected Results**:
  - Appropriate error messages
  - SharedKernelError codes mapped to messages
  - No session created
  - User remains on sign-in page

### 3. Token Management

#### Test Case 3.1: Automatic Token Refresh
- **Objective**: Verify seamless token refresh
- **Steps**:
  1. Sign in successfully
  2. Wait for token to near expiration
  3. Make API call requiring authentication
- **Expected Results**:
  - openapi-fetch interceptor triggers refresh
  - New token obtained from Clerk
  - API call succeeds with new token
  - No user interruption

#### Test Case 3.2: Concurrent API Calls During Refresh
- **Objective**: Verify race condition handling
- **Steps**:
  1. Sign in successfully
  2. Trigger multiple API calls simultaneously
  3. Force token refresh scenario
- **Expected Results**:
  - Only one refresh request made
  - Other requests queued
  - All requests succeed with new token
  - No duplicate refresh attempts

#### Test Case 3.3: Token Refresh Failure
- **Objective**: Verify handling of refresh failures
- **Steps**:
  1. Sign in successfully
  2. Invalidate refresh capability
  3. Attempt API call after token expiry
- **Expected Results**:
  - Refresh attempt fails
  - SharedKernelError returned
  - User redirected to sign-in
  - Session cleared

### 4. Logout Flow

#### Test Case 4.1: Standard Logout
- **Objective**: Verify complete logout process
- **Steps**:
  1. Sign in successfully
  2. Click logout button
- **Expected Results**:
  - Clerk session terminated
  - Backend token revoked via openapi-fetch
  - Local storage cleared
  - Redirect to sign-in page
  - Protected routes inaccessible

#### Test Case 4.2: Logout with API Failure
- **Objective**: Verify logout when revocation fails
- **Steps**:
  1. Sign in successfully
  2. Simulate backend unavailability
  3. Attempt logout
- **Expected Results**:
  - Clerk session still terminated
  - Error logged but not shown to user
  - Local session cleared
  - User still logged out successfully

### 5. Role-Based Access Control

#### Test Case 5.1: Farmer Role Access
- **Objective**: Verify farmer-specific access
- **Steps**:
  1. Sign in as user with Farmer role
  2. Attempt to access farmer dashboard
  3. Attempt to access admin routes
- **Expected Results**:
  - Farmer dashboard accessible
  - Admin routes return 403
  - Correct UI elements shown
  - Role from Clerk metadata used

#### Test Case 5.2: Role Sync Failure
- **Objective**: Verify handling when role sync fails
- **Steps**:
  1. Complete sign-up
  2. Simulate metadata update failure
  3. Sign in again
- **Expected Results**:
  - User can still sign in
  - Default role applied
  - Warning logged
  - Basic access granted

### 6. Error Scenarios

#### Test Case 6.1: Network Errors
- **Objective**: Verify offline/network error handling
- **Steps**:
  1. Disable network during sign-up
  2. Disable network during sign-in
  3. Disable network during API calls
- **Expected Results**:
  - Appropriate error messages
  - No sensitive data exposed
  - Retry options where applicable
  - SharedKernelError network codes

#### Test Case 6.2: API Timeout
- **Objective**: Verify timeout handling
- **Steps**:
  1. Configure short timeout
  2. Simulate slow API responses
- **Expected Results**:
  - Timeout errors caught
  - User-friendly messages shown
  - No hanging UI states
  - Retry mechanisms available

### 7. Security Tests

#### Test Case 7.1: Session Hijacking Prevention
- **Objective**: Verify session security
- **Steps**:
  1. Sign in on one browser
  2. Copy session/tokens
  3. Attempt use in another browser
- **Expected Results**:
  - Session tied to origin
  - Token validation fails
  - Proper error handling

#### Test Case 7.2: Password Requirements
- **Objective**: Verify password validation
- **Steps**:
  1. Try passwords missing requirements
  2. Try SQL injection in password
  3. Try XSS in password
- **Expected Results**:
  - Validation errors shown
  - No security vulnerabilities
  - Clear requirement messages

## Automated Test Implementation

### Playwright Test Structure
```typescript
// e2e/auth/signup.spec.ts
test.describe('Sign Up Flow', () => {
  test('complete sign-up success path', async ({ page }) => {
    // Implementation
  });
});

// e2e/auth/signin.spec.ts
test.describe('Sign In Flow', () => {
  test('successful sign-in with role redirect', async ({ page }) => {
    // Implementation
  });
});

// e2e/auth/token-management.spec.ts
test.describe('Token Management', () => {
  test('automatic token refresh', async ({ page }) => {
    // Implementation
  });
});
```

### Test Utilities
- Mock Clerk responses
- Mock API responses
- Generate test data
- Clean up test users

## Success Metrics

1. **Coverage**: 100% of authentication paths tested
2. **Reliability**: Tests pass consistently
3. **Performance**: Auth flows complete within expected time
4. **Security**: No vulnerabilities exposed
5. **Error Handling**: All error scenarios handled gracefully

## Test Execution Schedule

1. **Development**: Run on every PR
2. **Staging**: Full suite before deployment
3. **Production**: Smoke tests after deployment
4. **Nightly**: Complete regression suite

## Reporting

- Test results dashboard
- Coverage reports
- Performance metrics
- Security scan results
- Bug tracking integration