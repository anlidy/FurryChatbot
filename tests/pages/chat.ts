import type { Page } from "@playwright/test";

export class ChatPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/");
  }

  async createNewChat() {
    await this.page.goto("/");
    await this.page.waitForSelector("[data-testid='multimodal-input']");
  }

  getInput() {
    return this.page.getByTestId("multimodal-input").first();
  }

  async typeMessage(message: string) {
    const input = this.getInput();
    await input.fill(message);
  }

  async sendMessage() {
    await this.page.getByTestId("send-button").click();
  }

  async sendUserMessage(message: string) {
    await this.typeMessage(message);
    await this.sendMessage();
  }

  getSendButton() {
    return this.page.getByTestId("send-button").first();
  }

  getStopButton() {
    return this.page.getByTestId("stop-button").first();
  }

  getModelSelectorTrigger() {
    return this.page.getByTestId("model-selector-trigger").first();
  }

  async clickSuggestedAction(index = 0) {
    const suggestions = this.page.locator(
      "[data-testid='suggested-actions'] button"
    );
    await suggestions.nth(index).click();
  }

  async openModelSelector() {
    await this.getModelSelectorTrigger().click();
  }

  async selectModel(modelName: string) {
    await this.openModelSelector();
    await this.page.getByText(modelName).first().click();
  }

  async searchModels(query: string) {
    await this.openModelSelector();
    await this.page.getByPlaceholder("Search models...").fill(query);
  }
}
