import type { Page } from "@playwright/test";
import type { ChatModel } from "../../lib/ai/models";
import { MOCK_MODELS } from "./models";

export async function mockModelsAPI(
  page: Page,
  models: ChatModel[] = MOCK_MODELS
) {
  await page.route("**/api/settings/models", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(models),
    });
  });
}

export async function mockModelsAPIEmpty(page: Page) {
  await mockModelsAPI(page, []);
}
