import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import {
  getCustomProviderById,
  getEnabledCustomModelsByUserId,
  getUserProfile,
} from "../db/queries";
import { decrypt } from "../encryption";

const THINKING_SUFFIX_REGEX = /-thinking$/;

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

/**
 * Create a provider API client instance for the specified provider format using the given base URL and API key.
 *
 * @param format - Provider format, either "openai" or "anthropic"
 * @param baseUrl - Base URL for the provider's API
 * @param apiKey - API key used to authenticate requests
 * @returns An instantiated client configured for the specified provider
 */
function createProviderInstance(
  format: "openai" | "anthropic",
  baseUrl: string,
  apiKey: string
) {
  if (format === "anthropic") {
    return createAnthropic({ baseURL: baseUrl, apiKey });
  }
  return createOpenAI({ baseURL: baseUrl, apiKey });
}

/**
 * Resolve a language model instance from a provider-scoped model identifier.
 *
 * @param modelId - Provider-scoped identifier in the form `providerId/modelId` (e.g. `acme/my-model`).
 * @returns A language model instance for the specified provider and model. If the model name indicates a reasoning variant (e.g., ends with `-thinking` or contains `reasoning`), the returned instance is wrapped with reasoning middleware.
 * @throws Error if `modelId` is not in the expected `providerId/modelId` format.
 * @throws Error if the referenced provider does not exist.
 * @throws Error if the referenced provider is disabled.
 */
export async function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const slashIndex = modelId.indexOf("/");
  if (slashIndex === -1) {
    throw new Error(`Invalid model ID format: ${modelId}`);
  }

  const providerId = modelId.slice(0, slashIndex);
  const rawModelId = modelId.slice(slashIndex + 1);

  const provider = await getCustomProviderById({ id: providerId });
  if (!provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }
  if (!provider.isEnabled) {
    throw new Error(`Provider is disabled: ${provider.name}`);
  }

  const apiKey = decrypt(provider.apiKey);
  const instance = createProviderInstance(
    provider.format,
    provider.baseUrl,
    apiKey
  );

  const isReasoningModel =
    rawModelId.endsWith("-thinking") ||
    (rawModelId.includes("reasoning") && !rawModelId.includes("non-reasoning"));

  const cleanModelId = rawModelId.replace(THINKING_SUFFIX_REGEX, "");

  if (isReasoningModel) {
    return wrapLanguageModel({
      model: instance(cleanModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return instance(cleanModelId);
}

/**
 * Selects the user's preferred language model or falls back to the first enabled provider model.
 *
 * @param userId - ID of the user whose model should be selected
 * @returns The language model instance determined for the user
 * @throws Error when no enabled models are available: "No models available. Please configure a provider in Settings."
 */
async function getSystemModel(userId: string) {
  const profile = await getUserProfile({ userId });
  const systemModelId = profile?.preferences?.defaultModel;

  if (systemModelId) {
    return getLanguageModel(systemModelId);
  }

  const enabledModels = await getEnabledCustomModelsByUserId({ userId });
  if (enabledModels.length === 0) {
    throw new Error(
      "No models available. Please configure a provider in Settings."
    );
  }

  const first = enabledModels[0];
  const fallbackId = `${first.provider.id}/${first.model.modelId}`;
  return getLanguageModel(fallbackId);
}

/**
 * Selects the language model to use for generating titles for the specified user.
 *
 * If running in the test environment, returns the test provider's "title-model"; otherwise returns the user's configured system model.
 *
 * @param userId - The ID of the user whose model preferences should be used
 * @returns The language model instance to use for title generation for the given user
 */
export async function getTitleModel(userId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return await getSystemModel(userId);
}

/**
 * Selects the language model to use for artifact generation for the specified user.
 *
 * @param userId - The ID of the user whose preferences or enabled models are used to select the model
 * @returns The language model instance to use for generating artifacts
 */
export async function getArtifactModel(userId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return await getSystemModel(userId);
}
