import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expects the page to have a title containing "Complete Farmer"
  await expect(page).toHaveTitle(/Complete Farmer/);
});

test("auth links are visible", async ({ page }) => {
  await page.goto("/");

  // Check if sign in and sign up links are visible
  await expect(page.getByText("Sign In")).toBeVisible();
  await expect(page.getByText("Sign Up")).toBeVisible();
});
