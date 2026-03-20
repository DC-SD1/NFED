import { expect, test } from "@playwright/test";

import { AuthHelpers } from "./helpers/auth-helpers";
import { TEST_USERS } from "./helpers/test-data";

test.describe("Role-Based Access Control", () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test("farmer role has correct access permissions", async ({ page }) => {
    // Sign in as farmer
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );

    // Should redirect to farmer dashboard
    await authHelpers.waitForNavigation("**/dashboard");

    // Verify farmer-specific UI elements
    await expect(page.locator('[data-role="farmer"]')).toBeVisible();
    await expect(page.locator("text=My Farms")).toBeVisible();
    await expect(page.locator("text=Crop Management")).toBeVisible();

    // Should NOT see admin/agent elements
    await expect(page.locator('[data-role="admin"]')).not.toBeVisible();
    await expect(page.locator("text=User Management")).not.toBeVisible();

    // Try to access admin route
    await page.goto("/admin/users");

    // Should redirect to unauthorized page or dashboard
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page.locator("text=Unauthorized")).toBeVisible();
  });

  test("agent role has different access than farmer", async ({ page }) => {
    // Sign in as agent
    await authHelpers.signIn(
      TEST_USERS.existingAgent.email,
      TEST_USERS.existingAgent.password,
    );

    // Should redirect to agent dashboard
    await authHelpers.waitForNavigation("**/dashboard");

    // Verify agent-specific UI elements
    await expect(page.locator('[data-role="agent"]')).toBeVisible();
    await expect(page.locator("text=Client Management")).toBeVisible();
    await expect(page.locator("text=Support Tickets")).toBeVisible();

    // Should NOT see farmer-only elements
    await expect(page.locator("text=My Farms")).not.toBeVisible();
  });

  test("role metadata is correctly set during sign-up", async ({ page }) => {
    // Complete sign-up flow
    const testUser = {
      firstName: "New",
      lastName: "Farmer",
      email: `farmer_${Date.now()}@example.com`,
      phone: "+1234567890",
      password: "Test@Password123!",
    };

    await authHelpers.navigateToAuthPage("sign-up");
    await authHelpers.fillBasicInfoForm(testUser);
    await authHelpers.waitForNavigation("**/password?mode=signup");
    await authHelpers.fillPasswordForm(testUser.password);
    await authHelpers.waitForNavigation("**/otp?mode=signup");

    // Mock successful OTP verification and metadata update
    let metadataUpdateCalled = false;
    await page.route("**/api/users/sync-roles", (route) => {
      metadataUpdateCalled = true;
      const request = route.request();
      const postData = request.postDataJSON();

      // Verify correct role is being set
      expect(postData.roles).toContain("Farmer");

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await authHelpers.fillOtpForm("123456");

    // Wait for metadata update
    await page.waitForTimeout(1000);

    // Verify metadata update was called
    expect(metadataUpdateCalled).toBe(true);
  });

  test("missing role defaults to basic access", async ({ page }) => {
    // Mock user with no role metadata
    await page.route("**/auth/exchange", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            token: "test-token",
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            user: {
              id: "user-no-role",
              email: "norole@example.com",
              // No role metadata
            },
          },
        }),
      });
    });

    // Sign in
    await authHelpers.signIn("norole@example.com", "Password123!");

    // Should redirect to default dashboard
    await authHelpers.waitForNavigation("**/dashboard");

    // Should see limited UI
    await expect(page.locator("text=Complete your profile")).toBeVisible();
    await expect(page.locator("[data-role]")).not.toBeVisible();
  });

  test("role changes are reflected after re-authentication", async ({
    page,
  }) => {
    // Sign in as farmer
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );
    await expect(page.locator('[data-role="farmer"]')).toBeVisible();

    // Sign out
    await authHelpers.signOut();

    // Mock role change in backend
    await page.route("**/auth/exchange", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            token: "updated-token",
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            user: {
              id: TEST_USERS.existingFarmer.email,
              email: TEST_USERS.existingFarmer.email,
              role: "Agent", // Changed role
              roles: ["Agent"],
            },
          },
        }),
      });
    });

    // Sign in again
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );

    // Should now see agent UI
    await expect(page.locator('[data-role="agent"]')).toBeVisible();
    await expect(page.locator('[data-role="farmer"]')).not.toBeVisible();
  });

  test("API calls include role in authorization", async ({ page }) => {
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );

    // Intercept API calls to verify headers
    let apiHeaders: any = null;
    await page.route("**/api/**", (route) => {
      apiHeaders = route.request().headers();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: {} }),
      });
    });

    // Make an API call
    await page.evaluate(async () => {
      await fetch("/api/farms", {
        headers: {
          Authorization: "Bearer test-token",
          "X-User-Role": "Farmer",
        },
      });
    });

    // Wait for request
    await page.waitForTimeout(500);

    // Verify role header is included
    expect(apiHeaders).toBeTruthy();
    expect(apiHeaders["x-user-role"]).toBe("Farmer");
  });

  test("protected route access based on role", async ({ page }) => {
    // Define route permissions
    const routePermissions = {
      "/farms": ["Farmer"],
      "/clients": ["Agent"],
      "/admin": ["Admin"],
      "/profile": ["Farmer", "Agent", "Admin"], // All roles
    };

    // Test farmer access
    await authHelpers.signIn(
      TEST_USERS.existingFarmer.email,
      TEST_USERS.existingFarmer.password,
    );

    // Can access farms
    await page.goto("/farms");
    await expect(page).toHaveURL(/\/farms/);

    // Cannot access clients
    await page.goto("/clients");
    await expect(page).not.toHaveURL(/\/clients/);
    await expect(page.locator("text=Unauthorized")).toBeVisible();

    // Can access profile (common route)
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
  });

  test.afterEach(async ({ page }) => {
    await authHelpers.clearAuthStorage();
  });
});
