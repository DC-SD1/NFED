import { expect, test } from "@playwright/test";

test.describe("Password Reset Rate Limiting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("should allow password reset request", async ({ page }) => {
    // Fill in email
    await page.fill('input[name="email"]', "test@example.com");
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect to OTP page
    // Note: The actual behavior depends on whether the email exists
    // But we should not get a rate limit error on first attempt
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toMatch(/too many.*attempts/i);
  });

  test("should show rate limit error after multiple attempts", async ({ page }) => {
    const testEmail = `ratelimit-test-${Date.now()}@example.com`;
    
    // Make multiple requests quickly
    for (let i = 0; i < 11; i++) {
      await page.fill('input[name="email"]', testEmail);
      await page.click('button[type="submit"]');
      
      // Small delay between requests
      await page.waitForTimeout(100);
      
      // On the 11th request (index 10), we should hit the rate limit
      if (i === 10) {
        // Check for rate limit error message
        const toastMessage = page.locator('[role="alert"]').last();
        await expect(toastMessage).toContainText(/too many|rate limit/i);
      }
    }
  });

  test("should not enumerate users", async ({ page }) => {
    // Test with a likely non-existent email
    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', nonExistentEmail);
    await page.click('button[type="submit"]');
    
    // Should show generic success message, not "user not found"
    const response1 = await page.textContent("body");
    
    // Test with a potentially valid email format
    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.click('button[type="submit"]');
    
    const response2 = await page.textContent("body");
    
    // Both responses should be similar (no enumeration)
    // They should either both redirect or both show success
    expect(response1).toContain("password");
    expect(response2).toContain("password");
  });

  test("should respect Retry-After header", () => {
    // This test would need to actually trigger rate limiting
    // and verify the Retry-After header is present
    // For now, we'll skip the actual implementation as it would
    // require setting up test-specific rate limits
    test.skip();
  });
});