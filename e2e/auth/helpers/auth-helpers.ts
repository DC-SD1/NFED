import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Helper functions for authentication E2E tests
 */

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a specific auth page with locale
   */
  async navigateToAuthPage(
    path: "sign-up" | "sign-in" | "password" | "otp",
    locale = "en",
  ) {
    await this.page.goto(`/${locale}/${path}`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill and submit the basic info form
   */
  async fillBasicInfoForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    await this.page.fill('input[name="firstName"]', data.firstName);
    await this.page.fill('input[name="lastName"]', data.lastName);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.fill('input[name="phone"]', data.phone);

    // Note: Terms checkbox moved to password form in current implementation

    // Submit form
    await this.page.click('button[type="submit"]');
  }

  /**
   * Fill and submit the password form
   */
  async fillPasswordForm(password: string) {
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);

    // For sign-up, check terms if present
    const termsCheckbox = this.page.locator('input[name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await this.page.click('button[type="submit"]');
  }

  /**
   * Fill and submit OTP form
   */
  async fillOtpForm(otp: string) {
    // OTP input is usually split into multiple inputs
    const otpChars = otp.split("");
    for (let i = 0; i < otpChars.length; i++) {
      await this.page.fill(`input[data-index="${i}"]`, otpChars[i]);
    }

    // Submit might be automatic or require button click
    const submitButton = this.page.locator(
      'button[type="submit"]:has-text("Verify")',
    );
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }

  /**
   * Complete sign-in flow
   */
  async signIn(email: string, password: string, locale = "en") {
    await this.navigateToAuthPage("sign-in", locale);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  /**
   * Sign out
   */
  async signOut() {
    // Click user menu or avatar
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }

    // Click logout button
    await this.page.click('button:has-text("Logout")');

    // Wait for redirect to sign-in with locale
    await this.page.waitForURL("**/sign-in");
  }

  /**
   * Check if user is authenticated by looking for dashboard elements
   */
  async checkAuthenticated() {
    // Look for elements that only appear when authenticated
    await expect(this.page.locator('[data-testid="dashboard"]')).toBeVisible();
  }

  /**
   * Check for error messages
   */
  async checkErrorMessage(expectedText?: string) {
    const errorElement = this.page.locator('[role="alert"], .text-destructive');
    await expect(errorElement).toBeVisible();

    if (expectedText) {
      await expect(errorElement).toContainText(expectedText);
    }

    return errorElement.textContent();
  }

  /**
   * Wait for and intercept API calls
   */
  async interceptApiCall(urlPattern: string | RegExp) {
    return this.page.waitForResponse(
      (response) =>
        (typeof urlPattern === "string"
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url())) &&
        response.request().method() === "POST",
    );
  }

  /**
   * Mock Clerk responses for testing
   */
  async mockClerkResponse(endpoint: string, response: any, status = 200) {
    await this.page.route(`**/*clerk*${endpoint}*`, (route) => {
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mock backend API responses
   */
  async mockApiResponse(endpoint: string, response: any, status = 200) {
    await this.page.route(`**/api${endpoint}`, (route) => {
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Check localStorage for auth tokens
   */
  async getStoredTokens() {
    return this.page.evaluate(() => {
      return {
        clerkToken: localStorage.getItem("__clerk_client_jwt"),
        apiToken: localStorage.getItem("api_token"),
        signUpData: localStorage.getItem("sign-up-storage"),
      };
    });
  }

  /**
   * Clear all auth-related storage
   */
  async clearAuthStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Complete marketing attribution step
   */
  async completeMarketingAttribution(channels: string[]) {
    for (const channel of channels) {
      await this.page.check(`input[value="${channel}"]`);
    }
    await this.page.click('button:has-text("Continue")');
  }

  /**
   * Complete farming experience selection
   */
  async selectFarmingExperience(experience: "newbie" | "experienced") {
    await this.page.click(`button[data-experience="${experience}"]`);
  }

  /**
   * Get network request details
   */
  async getLastApiRequest(urlPattern: string) {
    const requests = await this.page.evaluate((pattern) => {
      // This would need to be set up with page.on('request') in the test
      return (window as any).__capturedRequests
        ?.filter((req: any) => req.url.includes(pattern))
        .pop();
    }, urlPattern);

    return requests;
  }
}
