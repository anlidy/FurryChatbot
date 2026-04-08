## ADDED Requirements

### Requirement: All models are user-configured
The system SHALL NOT have any built-in or hardcoded model list. All available models SHALL come from user-configured custom providers. The `lib/ai/models.ts` hardcoded `chatModels` array and `DEFAULT_CHAT_MODEL` SHALL be removed.

#### Scenario: No providers configured
- **WHEN** user has not configured any custom providers
- **THEN** the model selector shows an empty state prompting the user to add a provider in Settings

#### Scenario: Models come from providers
- **WHEN** user has configured 2 providers with 3 models total
- **THEN** the model selector shows exactly those 3 models, grouped by provider

### Requirement: Remove Vercel AI Gateway
The system SHALL remove the `@ai-sdk/gateway` dependency entirely. The `gateway.languageModel()` calls in `lib/ai/providers.ts` SHALL be replaced with custom provider lookups. All model routing SHALL go through the custom provider system.

#### Scenario: Gateway removed
- **WHEN** the system starts
- **THEN** no `@ai-sdk/gateway` import exists; all model instantiation uses `createOpenAI` or `createAnthropic` from AI SDK

### Requirement: Model ID format (simplified)
Model IDs SHALL use the format `<providerId>/<modelId>` (no `custom:` prefix needed since there are no built-in models to distinguish from). The `getLanguageModel()` function SHALL parse this format to look up the provider and instantiate the model.

#### Scenario: Model resolved
- **WHEN** `getLanguageModel("abc-123/gpt-4o")` is called
- **THEN** the system looks up provider `abc-123`, decrypts its API key, and returns a language model instance

#### Scenario: Invalid model ID
- **WHEN** `getLanguageModel("nonexistent/model")` is called
- **THEN** the system throws an error indicating the provider was not found

### Requirement: Custom provider instantiation
The system SHALL instantiate custom providers at runtime using the AI SDK factories based on the provider's format setting. For "openai" format, use `createOpenAI({ baseURL, apiKey })`. For "anthropic" format, use `createAnthropic({ baseURL, apiKey })`.

#### Scenario: OpenAI-compatible provider
- **WHEN** a chat uses a model from a provider with format "openai" and base URL "https://api.openrouter.ai/api/v1"
- **THEN** the system calls `createOpenAI({ baseURL: "https://api.openrouter.ai/api/v1", apiKey: "<decrypted>" })` and uses the resulting provider

#### Scenario: Anthropic-compatible provider
- **WHEN** a chat uses a model from a provider with format "anthropic"
- **THEN** the system calls `createAnthropic({ baseURL, apiKey })` and uses the resulting provider

### Requirement: System models (title, artifact) from user config
`getTitleModel()` and `getArtifactModel()` SHALL use models from the user's configured providers instead of hardcoded gateway models. The user's preferences SHALL include a `systemModel` field that specifies which provider/model to use for system tasks. If not configured, the system SHALL use the first available enabled model.

#### Scenario: System model configured
- **WHEN** user has set `systemModel` preference to a specific model
- **THEN** `getTitleModel()` and `getArtifactModel()` use that model

#### Scenario: System model fallback
- **WHEN** user has not configured a system model but has at least one enabled model
- **THEN** `getTitleModel()` and `getArtifactModel()` use the first available enabled model

#### Scenario: No models available
- **WHEN** user has no enabled models
- **THEN** system tasks that need a model fail gracefully with a clear error

### Requirement: Model selector shows only custom models
The model selector SHALL display only user-configured custom models, grouped by provider name. There SHALL be no "built-in" section.

#### Scenario: Model list
- **WHEN** user has provider "OpenRouter" with models "GPT-4o" and "Claude 3.5" enabled
- **THEN** the model selector shows a "OpenRouter" group with those 2 models

### Requirement: Custom model validation in chat API
The chat API route SHALL validate that the referenced provider exists, is enabled, and belongs to the current user.

#### Scenario: Valid model
- **WHEN** a chat request uses `abc-123/gpt-4o` and provider `abc-123` exists and is enabled for this user
- **THEN** the request proceeds with the custom provider

#### Scenario: Invalid model
- **WHEN** a chat request uses `nonexistent/model`
- **THEN** the API returns a 400 error indicating the model is not available
