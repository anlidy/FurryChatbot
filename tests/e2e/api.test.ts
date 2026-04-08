import { expect } from "@playwright/test";
import { test } from "../fixtures";

const CHAT_URL_REGEX = /\/chat\/[\w-]+/;
const ERROR_TEXT_REGEX = /error|failed|trouble/i;

test.describe("Chat API Integration", () => {
  test.beforeEach(async ({ chatPage }) => {
    await chatPage.goto();
  });

  test("sends message and receives AI response", async ({ chatPage, page }) => {
    await chatPage.sendUserMessage("Hello");

    const assistantMessage = page.locator("[data-role='assistant']").first();
    await expect(assistantMessage).toBeVisible({ timeout: 30_000 });

    const content = await assistantMessage.textContent();
    expect(content?.length).toBeGreaterThan(0);
  });

  test("redirects to /chat/:id after sending message", async ({
    chatPage,
    page,
  }) => {
    await chatPage.sendUserMessage("Test redirect");
    await expect(page).toHaveURL(CHAT_URL_REGEX, { timeout: 10_000 });
  });

  test("shows stop button during generation", async ({ chatPage }) => {
    await chatPage.sendUserMessage("Tell me a long story");
    await expect(chatPage.getStopButton()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Chat Error Handling", () => {
  test("handles API error gracefully", async ({ chatPage, page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await chatPage.goto();
    await chatPage.sendUserMessage("Test error");

    await expect(page.getByText(ERROR_TEXT_REGEX).first()).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Suggested Actions", () => {
  test("suggested actions are clickable", async ({ chatPage, page }) => {
    await chatPage.goto();

    const suggestions = page.locator(
      "[data-testid='suggested-actions'] button"
    );
    const count = await suggestions.count();

    if (count > 0) {
      await suggestions.first().click();
      await expect(page).toHaveURL(CHAT_URL_REGEX, { timeout: 10_000 });
    }
  });
});
