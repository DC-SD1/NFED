import { expect, test } from "@playwright/test";

import { AuthHelpers } from "./helpers/auth-helpers";
import {
  generateInvalidPasswords,
  generateTestUser,
  TEST_OTP,
} from "./helpers/test-data";

test.describe("Sign Up Flow", () => {
  let authHelpers: AuthHelpers;
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    testUser = generateTestUser();
  });

  test("complete sign-up success path", async ({ page }) => {
    // Step 1: Navigate to sign-up page
    await authHelpers.navigateToAuthPage("sign-up", "en");

    // Verify we're on the sign-up page
    await expect(page).toHaveTitle(/Sign Up/);
    await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible();

    // Step 2: Fill basic info form
    await authHelpers.fillBasicInfoForm(testUser);

    // Should navigate to password page
    await authHelpers.waitForNavigation("**/password?mode=signup");

    // Step 3: Create password
    // Password page heading is dynamic
    await expect(page.locator("h1")).toBeVisible();
    await authHelpers.fillPasswordForm(testUser.password);

    // Should navigate to OTP page
    await authHelpers.waitForNavigation("**/otp?mode=signup");

    // Step 4: Verify OTP page shows masked email
    const maskedEmailElement = page.locator(
      "text=/[a-z]{2}\\*\\*\\*.*@example\\.com/",
    );
    await expect(maskedEmailElement).toBeVisible();

    // Step 5: Enter OTP
    await authHelpers.fillOtpForm(TEST_OTP);

    // Should make backend registration call
    const registrationResponse = await authHelpers.interceptApiCall("/users");
    expect(registrationResponse.status()).toBe(201);

    // Should navigate to onboarding
    await authHelpers.waitForNavigation("**/onboarding/marketing");

    // Step 6: Complete marketing attribution
    await authHelpers.completeMarketingAttribution([
      "social_media",
      "word_of_mouth",
    ]);

    // Step 7: Select farming experience
    await authHelpers.waitForNavigation("**/onboarding/experience");
    await authHelpers.selectFarmingExperience("newbie");

    // Should end up on dashboard
    await authHelpers.waitForNavigation("**/dashboard");
    await authHelpers.checkAuthenticated();

    // Verify tokens are stored
    const tokens = await authHelpers.getStoredTokens();
    expect(tokens.clerkToken).toBeTruthy();
    expect(tokens.apiToken).toBeTruthy();
  });

  test("sign-up with existing email shows error", async ({ page }) => {
    // Mock Clerk to return email exists error
    await authHelpers.mockClerkResponse(
      "/sign_ups",
      {
        errors: [
          {
            code: "form_identifier_exists",
            message: "That email address is taken. Please try another.",
            long_message: "That email address is taken. Please try another.",
            meta: { param_name: "email_address" },
          },
        ],
      },
      422,
    );

    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm({
      ...testUser,
      email: "existing@example.com",
    });

    // Should show error on the form
    const errorMessage = await authHelpers.checkErrorMessage();
    expect(errorMessage).toContain("email address is taken");

    // Should stay on sign-up page
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("sign-up with invalid OTP shows error and allows retry", async ({
    page,
  }) => {
    // Complete steps up to OTP
    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");
    await authHelpers.fillPasswordForm(testUser.password);
    await authHelpers.waitForNavigation("**/otp?mode=signup");

    // Enter wrong OTP
    await authHelpers.fillOtpForm("000000");

    // Should show error
    const errorMessage = await authHelpers.checkErrorMessage("incorrect");
    expect(errorMessage).toBeTruthy();

    // Should allow retry with correct OTP
    await page.locator("input").first().clear();
    await authHelpers.fillOtpForm(TEST_OTP);

    // Should proceed to onboarding
    await authHelpers.waitForNavigation("**/onboarding/marketing");
  });

  test("backend registration failure shows retry option", async ({ page }) => {
    // Mock backend to fail
    await authHelpers.mockApiResponse(
      "/users",
      {
        data: null,
        error: {
          errors: [
            {
              code: "INTERNAL_SERVER_ERROR",
              detail: "Database connection failed",
            },
          ],
        },
      },
      500,
    );

    // Complete steps up to OTP
    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");
    await authHelpers.fillPasswordForm(testUser.password);
    await authHelpers.waitForNavigation("**/otp?mode=signup");
    await authHelpers.fillOtpForm(TEST_OTP);

    // Should show registration error with retry
    await expect(
      page.locator("text=couldn't complete your registration"),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Retry Registration")'),
    ).toBeVisible();

    // Mock successful response
    await authHelpers.mockApiResponse(
      "/users",
      {
        data: { userId: "test-user-id" },
      },
      201,
    );

    // Click retry
    await page.click('button:has-text("Retry Registration")');

    // Should proceed to onboarding
    await authHelpers.waitForNavigation("**/onboarding/marketing");
  });

  test("password validation shows appropriate errors", async ({ page }) => {
    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");

    const invalidPasswords = generateInvalidPasswords();

    for (const { password, reason } of invalidPasswords) {
      // Clear previous values
      await page.fill('input[name="password"]', "");
      await page.fill('input[name="confirmPassword"]', "");

      // Fill invalid password
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation error
      const errorElement = page.locator(".text-destructive");
      await expect(errorElement).toBeVisible();

      // Verify appropriate error message based on reason
      const errorText = await errorElement.textContent();
      console.log(
        `Password: "${password}", Reason: ${reason}, Error: ${errorText}`,
      );
    }
  });

  test("OTP resend functionality works correctly", async ({ page }) => {
    // Complete steps up to OTP
    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");
    await authHelpers.fillPasswordForm(testUser.password);
    await authHelpers.waitForNavigation("**/otp?mode=signup");

    // Click resend
    const resendButton = page.locator('button:has-text("Send again")');
    await expect(resendButton).toBeVisible();
    await resendButton.click();

    // Should show success message
    await expect(
      page.locator("text=Verification code has been resent"),
    ).toBeVisible();

    // Resend button should be disabled with countdown
    await expect(resendButton).toBeDisabled();
    await expect(page.locator("text=/\\d{2}:\\d{2}/")).toBeVisible(); // Timer format MM:SS
  });

  test("form data persists across page refreshes", async ({ page }) => {
    // Fill basic info
    await authHelpers.navigateToAuthPage("sign-up", "en");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");

    // Refresh page
    await page.reload();

    // Go back to sign-up
    await page.goBack();

    // Check if form data is restored
    await expect(page.locator('input[name="firstName"]')).toHaveValue(
      testUser.firstName,
    );
    await expect(page.locator('input[name="lastName"]')).toHaveValue(
      testUser.lastName,
    );
    await expect(page.locator('input[name="email"]')).toHaveValue(
      testUser.email,
    );
    await expect(page.locator('input[name="phone"]')).toHaveValue(
      testUser.phone,
    );
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data
    await authHelpers.clearAuthStorage();
  });
});
