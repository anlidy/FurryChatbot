import { expect, test } from "@playwright/test";
import { MOCK_MODELS, MOCK_PROVIDERS } from "../mocks/models";
import { mockModelsAPI, mockModelsAPIEmpty } from "../mocks/routes";

test.describe("Model Selector", () => {
  test.describe("with models configured", () => {
    test.beforeEach(async ({ page }) => {
      await mockModelsAPI(page);
      await page.goto("/");
      await page.waitForSelector("[data-testid='model-selector-trigger']");
    });

    test("displays the model selector trigger", async ({ page }) => {
      const trigger = page.getByTestId("model-selector-trigger").first();
      await expect(trigger).toBeVisible();
    });

    test("trigger shows selected model name", async ({ page }) => {
      const trigger = page.getByTestId("model-selector-trigger").first();
      const text = await trigger.textContent();
      const matchesAnyModel =
        MOCK_MODELS.some((m) => text?.includes(m.name)) ||
        text?.includes("Select model");
      expect(matchesAnyModel).toBeTruthy();
    });

    test("opens dialog with search input on click", async ({ page }) => {
      await page.getByTestId("model-selector-trigger").first().click();
      await expect(page.getByPlaceholder("Search models...")).toBeVisible();
    });

    test("shows provider groups", async ({ page }) => {
      await page.getByTestId("model-selector-trigger").first().click();

      for (const provider of MOCK_PROVIDERS) {
        await expect(page.getByText(provider).first()).toBeVisible();
      }
    });

    test("can search and filter models", async ({ page }) => {
      await page.getByTestId("model-selector-trigger").first().click();
      await page.getByPlaceholder("Search models...").fill("Claude");

      await expect(page.getByText("Claude Haiku").first()).toBeVisible();
      await expect(page.getByText("Claude Sonnet").first()).toBeVisible();
      await expect(page.getByText("GPT-4o")).not.toBeVisible();
    });

    test("can select a different model", async ({ page }) => {
      await page.getByTestId("model-selector-trigger").first().click();
      await page.getByText("Claude Haiku").first().click();

      await expect(page.getByPlaceholder("Search models...")).not.toBeVisible();

      await expect(
        page.getByTestId("model-selector-trigger").first()
      ).toContainText("Claude Haiku");
    });

    test("closes dialog on Escape", async ({ page }) => {
      await page.getByTestId("model-selector-trigger").first().click();
      await expect(page.getByPlaceholder("Search models...")).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(page.getByPlaceholder("Search models...")).not.toBeVisible();
    });
  });

  test.describe("with no models configured", () => {
    test.beforeEach(async ({ page }) => {
      await mockModelsAPIEmpty(page);
      await page.goto("/");
      await page.waitForSelector("[data-testid='model-selector-trigger']");
    });

    test("shows configure provider prompt", async ({ page }) => {
      const trigger = page.getByTestId("model-selector-trigger").first();
      await expect(trigger).toContainText("Configure a provider");
    });

    test("navigates to provider settings on click", async ({ page }) => {
      const trigger = page.getByTestId("model-selector-trigger").first();
      await trigger.click();
      await page.waitForURL("**/settings/providers");
      expect(page.url()).toContain("/settings/providers");
    });
  });
});
