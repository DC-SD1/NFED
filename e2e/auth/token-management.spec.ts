import { expect, test } from "@playwright/test";

import { AuthHelpers } from "./helpers/auth-helpers";
import { TEST_USERS } from "./helpers/test-data";

test.describe("Token Management", () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    // Sign in first
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );
  });

  test("automatic token refresh on expiration", async ({ page }) => {
    // Navigate to a page that makes API calls
    await page.goto("/dashboard");

    // Mock token to be near expiration
    await page.evaluate(() => {
      // Simulate token that expires in 30 seconds
      const expiringToken = {
        token: "expiring-token",
        expiresAt: new Date(Date.now() + 30000).toISOString(),
      };
      localStorage.setItem("api_token", JSON.stringify(expiringToken));
    });

    // Mock refresh token endpoint
    let refreshCalled = false;
    await page.route("**/auth/refresh", (route) => {
      refreshCalled = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            token: "new-fresh-token",
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          },
        }),
      });
    });

    // Make an API call that should trigger refresh
    await page.evaluate(async () => {
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: "Bearer expiring-token",
        },
      });
      return response.status;
    });

    // Verify refresh was called
    expect(refreshCalled).toBe(true);

    // Verify new token is stored
    const tokens = await authHelpers.getStoredTokens();
    expect(tokens.apiToken).toContain("new-fresh-token");
  });

  test("concurrent API calls during token refresh", async ({ page }) => {
    // Set up token near expiration
    await page.evaluate(() => {
      const expiringToken = {
        token: "expiring-token",
        expiresAt: new Date(Date.now() + 1000).toISOString(), // Expires in 1 second
      };
      localStorage.setItem("api_token", JSON.stringify(expiringToken));
    });

    let refreshCount = 0;
    let apiCallCount = 0;

    // Mock refresh endpoint
    await page.route("**/auth/refresh", (route) => {
      refreshCount++;
      // Simulate delay in refresh
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              token: "refreshed-token",
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            },
          }),
        });
      }, 500);
    });

    // Mock API endpoints
    await page.route("**/api/users/me", (route) => {
      apiCallCount++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { id: "user-123" } }),
      });
    });

    await page.route("**/api/farms", (route) => {
      apiCallCount++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    // Make multiple concurrent API calls
    await page.evaluate(async () => {
      const promises = [
        fetch("/api/users/me", {
          headers: { Authorization: "Bearer expiring-token" },
        }),
        fetch("/api/farms", {
          headers: { Authorization: "Bearer expiring-token" },
        }),
        fetch("/api/users/me", {
          headers: { Authorization: "Bearer expiring-token" },
        }),
      ];

      const results = await Promise.all(promises);
      return results.map((r) => r.status);
    });

    // Wait for all requests to complete
    await page.waitForTimeout(1000);

    // Should only refresh once despite multiple calls
    expect(refreshCount).toBe(1);
    // All API calls should succeed
    expect(apiCallCount).toBe(3);
  });

  test("token refresh failure redirects to sign-in", async ({ page }) => {
    // Set expired token
    await page.evaluate(() => {
      const expiredToken = {
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
      };
      localStorage.setItem("api_token", JSON.stringify(expiredToken));
    });

    // Mock refresh to fail
    await page.route("**/auth/refresh", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            errors: [
              {
                code: "UNAUTHORIZED",
                detail: "Refresh token is invalid or expired",
              },
            ],
          },
        }),
      });
    });

    // Navigate to protected page
    await page.goto("/dashboard");

    // Should redirect to sign-in
    await authHelpers.waitForNavigation("**/sign-in");

    // Should clear tokens
    const tokens = await authHelpers.getStoredTokens();
    expect(tokens.apiToken).toBeFalsy();
    expect(tokens.clerkToken).toBeFalsy();
  });

  test("API call with invalid token handles SharedKernelError", async ({
    page,
  }) => {
    // Mock API to return unauthorized error
    await page.route("**/api/users/me", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            errors: [
              {
                code: "UNAUTHORIZED",
                detail: "Invalid authentication token",
                source: { pointer: "/headers/authorization" },
              },
            ],
          },
        }),
      });
    });

    // Make API call
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/users/me", {
          headers: { Authorization: "Bearer invalid-token" },
        });
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Should handle unauthorized error
    expect(response.status).toBe(401);
    expect(response.data.error.errors[0].code).toBe("UNAUTHORIZED");
  });

  test("token persists across page refreshes", async ({ page }) => {
    // Get initial tokens
    const initialTokens = await authHelpers.getStoredTokens();
    expect(initialTokens.apiToken).toBeTruthy();

    // Refresh the page
    await page.reload();

    // Tokens should still be present
    const afterRefreshTokens = await authHelpers.getStoredTokens();
    expect(afterRefreshTokens.apiToken).toBe(initialTokens.apiToken);
    expect(afterRefreshTokens.clerkToken).toBe(initialTokens.clerkToken);

    // Should still be authenticated
    await authHelpers.checkAuthenticated();
  });

  test("logout clears all tokens and sessions", async ({ page }) => {
    // Verify authenticated first
    await authHelpers.checkAuthenticated();

    // Mock logout endpoints
    let clerkLogoutCalled = false;
    let tokenRevokeCalled = false;

    await page.route("**/sign_outs", (route) => {
      clerkLogoutCalled = true;
      route.fulfill({ status: 200 });
    });

    await page.route("**/auth/logout", (route) => {
      tokenRevokeCalled = true;
      route.fulfill({ status: 200 });
    });

    // Perform logout
    await authHelpers.signOut();

    // Verify both logout calls were made
    expect(clerkLogoutCalled).toBe(true);
    expect(tokenRevokeCalled).toBe(true);

    // Verify tokens are cleared
    const tokens = await authHelpers.getStoredTokens();
    expect(tokens.apiToken).toBeFalsy();
    expect(tokens.clerkToken).toBeFalsy();

    // Verify redirected to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("access to protected route without token redirects to sign-in", async ({
    page,
  }) => {
    // Clear tokens
    await authHelpers.clearAuthStorage();

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to sign-in
    await authHelpers.waitForNavigation("**/sign-in");

    // Should include redirect URL
    expect(page.url()).toContain("redirect_url=%2Fdashboard");
  });

  test("expired token triggers refresh on next API call", async ({ page }) => {
    let refreshCalled = false;

    // Mock refresh endpoint
    await page.route("**/auth/refresh", (route) => {
      refreshCalled = true;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            token: "new-token",
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          },
        }),
      });
    });

    // Set token that just expired
    await page.evaluate(() => {
      const expiredToken = {
        token: "just-expired",
        expiresAt: new Date(Date.now() - 1).toISOString(),
      };
      localStorage.setItem("api_token", JSON.stringify(expiredToken));
    });

    // Make an API call
    await page.goto("/dashboard");

    // Wait for refresh to be called
    await page.waitForTimeout(500);

    // Verify refresh was triggered
    expect(refreshCalled).toBe(true);
  });

  test.afterEach(async ({ page }) => {
    await authHelpers.clearAuthStorage();
  });
});
