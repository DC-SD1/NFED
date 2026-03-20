import { expect, test } from "@playwright/test";

test.describe("Authentication Flow - Fixed", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page with locale
    await page.goto("/en");
  });

  test("can navigate to sign-in page", async ({ page }) => {
    // The app should redirect to sign-in when accessing protected routes
    await page.goto("/en/dashboard");

    // Should be redirected to local sign-in page
    await expect(page.url()).toContain("/en/sign-in");

    // Sign-in page should be visible with Sign In heading
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("can navigate to sign-up page", async ({ page }) => {
    // Go to sign-up page with locale
    await page.goto("/en/sign-up");

    // Should see the custom sign-up form with heading
    await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible();

    // Should see the basic info form
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });

  test("sign-up form validation works", async ({ page }) => {
    await page.goto("/en/sign-up");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(
      page.locator("text=First name must be at least 2 characters"),
    ).toBeVisible();
    await expect(
      page.locator("text=Last name must be at least 2 characters"),
    ).toBeVisible();
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
  });

  test("can fill sign-up form and proceed to password", async ({ page }) => {
    await page.goto("/en/sign-up");

    // Fill the form
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', "+1234567890");

    // Note: Terms checkbox is now in password page, not basic info form

    // Submit
    await page.click('button[type="submit"]');

    // Should navigate to password page
    await page.waitForURL("**/password?mode=signup");
    // Password page headings are dynamic based on mode
    await expect(page.locator("h1")).toBeVisible();

    // Should see password form
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test("password validation shows requirements", async ({ page }) => {
    // Navigate through sign-up to password page
    await page.goto("/en/sign-up");
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', "+1234567890");
    await page.check('input[name="terms"]');
    await page.click('button[type="submit"]');

    await page.waitForURL("**/password?mode=signup");

    // Check terms if visible (conditional in password form)
    const termsCheckbox = page.locator('input[name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Enter weak password
    await page.fill('input[name="password"]', "weak");
    await page.fill('input[name="confirmPassword"]', "weak");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator(".text-destructive")).toBeVisible();
  });

  test("protected routes redirect to sign-in", async ({ page }) => {
    // Try to access various protected routes
    const protectedRoutes = ["/en/dashboard", "/en/profile", "/en/farms"];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should be redirected to local sign-in page
      await expect(page.url()).toContain("/sign-in");
      await expect(page.url()).toContain("redirect_url");
    }
  });

  test("public routes are accessible", async ({ page }) => {
    // These routes should be accessible without authentication
    const publicRoutes = ["/en/sign-up", "/en/password", "/en/otp"];

    for (const route of publicRoutes) {
      await page.goto(route);

      // Should not redirect away from the page
      await expect(page.url()).toContain(route);

      // Page should load successfully
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("multi-step sign-up flow navigation", async ({ page }) => {
    // Start sign-up process
    await page.goto("/en/sign-up");

    // Step 1: Basic Info
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', "+1234567890");
    await page.check('input[name="terms"]');
    await page.click('button[type="submit"]');

    // Step 2: Password
    await page.waitForURL("**/password?mode=signup");
    await expect(page.locator("h1")).toBeVisible();

    // Note: Cannot proceed further without Clerk test mode
    // as it requires actual email verification
  });
});
