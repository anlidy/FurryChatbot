import { expect } from "@playwright/test";
import { test } from "../fixtures";

test.describe("Chat Page", () => {
  test.beforeEach(async ({ chatPage }) => {
    await chatPage.goto();
  });

  test("home page loads with input field", async ({ chatPage }) => {
    await expect(chatPage.getInput()).toBeVisible();
  });

  test("can type in the input field", async ({ chatPage }) => {
    await chatPage.typeMessage("Hello world");
    await expect(chatPage.getInput()).toHaveValue("Hello world");
  });

  test("submit button is visible", async ({ chatPage }) => {
    await expect(chatPage.getSendButton()).toBeVisible();
  });

  test("suggested actions are visible on empty chat", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("[data-testid='suggested-actions']")
    ).toBeVisible();
  });

  test("input clears after sending", async ({ chatPage }) => {
    await chatPage.typeMessage("Test message");
    await chatPage.sendMessage();
    await expect(chatPage.getInput()).toHaveValue("");
  });

  test("input supports multiline text", async ({ chatPage }) => {
    const multiline = "Line 1\nLine 2\nLine 3";
    await chatPage.typeMessage(multiline);
    await expect(chatPage.getInput()).toHaveValue(multiline);
  });
});
