import { expect, test } from "@playwright/test";

import { AuthHelpers } from "./helpers/auth-helpers";
import { TEST_USERS } from "./helpers/test-data";

test.describe("Sign In Flow", () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test("successful sign-in with farmer role", async ({ page }) => {
    const farmer = TEST_USERS.existingFarmer;

    // Navigate to sign-in
    await authHelpers.navigateToAuthPage("sign-in");

    // Verify we're on sign-in page
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.locator("h1")).toContainText("Welcome back");

    // Fill credentials
    await page.fill('input[name="email"]', farmer.email);
    await page.fill('input[name="password"]', farmer.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should perform token exchange
    const tokenExchangeResponse =
      await authHelpers.interceptApiCall("/auth/exchange");
    expect(tokenExchangeResponse.status()).toBe(200);

    // Should redirect to farmer dashboard
    await authHelpers.waitForNavigation("**/dashboard");

    // Verify authenticated state
    await authHelpers.checkAuthenticated();

    // Verify role-based UI elements
    await expect(page.locator('[data-role="farmer"]')).toBeVisible();

    // Verify tokens are stored
    const tokens = await authHelpers.getStoredTokens();
    expect(tokens.clerkToken).toBeTruthy();
    expect(tokens.apiToken).toBeTruthy();
  });

  test("sign-in with invalid email shows error", async ({ page }) => {
    await authHelpers.navigateToAuthPage("sign-in");

    // Try invalid email format
    await page.fill('input[name="email"]', "notanemail");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorMessage = await authHelpers.checkErrorMessage("valid email");
    expect(errorMessage).toBeTruthy();

    // Should stay on sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in with wrong password shows error", async ({ page }) => {
    // Mock Clerk to return invalid credentials error
    await authHelpers.mockClerkResponse(
      "/sign_ins",
      {
        errors: [
          {
            code: "form_password_incorrect",
            message: "Password is incorrect. Try again, or use another method.",
            long_message:
              "Password is incorrect. Try again, or use another method.",
            meta: { param_name: "password" },
          },
        ],
      },
      422,
    );

    await authHelpers.navigateToAuthPage("sign-in");

    await page.fill('input[name="email"]', TEST_USERS.existingFarmer.email);
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Should show error
    const errorMessage = await authHelpers.checkErrorMessage("incorrect");
    expect(errorMessage).toBeTruthy();

    // Password field should be cleared
    await expect(page.locator('input[name="password"]')).toHaveValue("");

    // Should stay on sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in with non-existent email shows error", async ({ page }) => {
    // Mock Clerk to return not found error
    await authHelpers.mockClerkResponse(
      "/sign_ins",
      {
        errors: [
          {
            code: "form_identifier_not_found",
            message: "Couldn't find your account.",
            long_message: "Couldn't find an account for that email address.",
            meta: { param_name: "identifier" },
          },
        ],
      },
      404,
    );

    await authHelpers.navigateToAuthPage("sign-in");

    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Should show error
    const errorMessage = await authHelpers.checkErrorMessage("Couldn't find");
    expect(errorMessage).toBeTruthy();

    // Should stay on sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in redirects to original requested page", async ({ page }) => {
    // Try to access protected page
    await page.goto("/profile");

    // Should redirect to sign-in with return URL
    await authHelpers.waitForNavigation("**/sign-in");
    expect(page.url()).toContain("redirect_url=%2Fprofile");

    // Sign in
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );

    // Should redirect to originally requested page
    await authHelpers.waitForNavigation("**/profile");
  });

  test("sign-in with rate limiting shows appropriate error", async ({
    page,
  }) => {
    // Mock Clerk to return rate limit error
    await authHelpers.mockClerkResponse(
      "/sign_ins",
      {
        errors: [
          {
            code: "too_many_requests",
            message: "Too many requests. Please try again in a few minutes.",
            long_message:
              "You have made too many requests. Please wait a few minutes and try again.",
          },
        ],
      },
      429,
    );

    await authHelpers.navigateToAuthPage("sign-in");

    await page.fill('input[name="email"]', TEST_USERS.existingFarmer.email);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Should show rate limit error
    const errorMessage =
      await authHelpers.checkErrorMessage("Too many requests");
    expect(errorMessage).toBeTruthy();
  });

  test("forgot password link navigates correctly", async ({ page }) => {
    await authHelpers.navigateToAuthPage("sign-in");

    // Click forgot password
    await page.click('a:has-text("Forgot your password?")');

    // Should navigate to password reset
    await authHelpers.waitForNavigation("**/forgot-password");
    await expect(page.locator("h1")).toContainText("Reset");
  });

  test("sign up link navigates correctly", async ({ page }) => {
    await authHelpers.navigateToAuthPage("sign-in");

    // Click sign up link
    await page.click('a:has-text("Sign up")');

    // Should navigate to sign-up page
    await authHelpers.waitForNavigation("**/sign-up");
    await expect(page.locator("h1")).toContainText("Create your account");
  });

  test("password field toggle visibility works", async ({ page }) => {
    await authHelpers.navigateToAuthPage("sign-in");

    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[aria-label*="password"]');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Fill password
    await passwordInput.fill("TestPassword123!");

    // Click toggle to show
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle to hide again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("sign-in form validation prevents submission with empty fields", async ({
    page,
  }) => {
    await authHelpers.navigateToAuthPage("sign-in");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();

    // Should not make API call
    let apiCalled = false;
    page.on("request", (request) => {
      if (request.url().includes("/sign_ins")) {
        apiCalled = true;
      }
    });

    await page.waitForTimeout(1000);
    expect(apiCalled).toBe(false);
  });

  test.afterEach(async ({ page }) => {
    // Clean up
    await authHelpers.clearAuthStorage();
  });
});
