## ADDED Requirements

### Requirement: Custom provider database storage
The system SHALL store custom providers in a `custom_provider` table with fields: `id` (uuid), `userId` (FK to user), `name` (varchar), `baseUrl` (text), `apiKey` (text, encrypted), `format` (varchar, enum: "openai" | "anthropic"), `isEnabled` (boolean), `createdAt`, `updatedAt`. Each user MAY have multiple providers.

#### Scenario: Provider persisted
- **WHEN** user creates a provider with name "My Proxy", base URL "https://api.example.com/v1", and format "openai"
- **THEN** a row is inserted in `custom_provider` with the API key encrypted using AES-256-GCM

### Requirement: Custom model database storage
The system SHALL store custom models in a `custom_model` table with fields: `id` (uuid), `providerId` (FK to custom_provider), `modelId` (varchar), `displayName` (varchar), `isEnabled` (boolean), `createdAt`. Each provider MAY have multiple models.

#### Scenario: Model persisted
- **WHEN** user adds model "gpt-4o" with display name "GPT-4o" to a provider
- **THEN** a row is inserted in `custom_model` linked to the provider

### Requirement: API key encryption at rest
The system SHALL encrypt API keys using AES-256-GCM before storing in the database. The encryption key SHALL be read from the `ENCRYPTION_KEY` environment variable. API keys SHALL never be exposed in full to the client — API responses SHALL return masked keys showing only the last 4 characters.

#### Scenario: Key stored encrypted
- **WHEN** user saves a provider with API key "sk-abc123xyz"
- **THEN** the database stores an encrypted string (iv:authTag:ciphertext), not the plaintext key

#### Scenario: Key masked in API response
- **WHEN** client fetches provider details
- **THEN** the API key field returns "sk-...xyz" (masked, last 4 visible)

#### Scenario: Key decrypted for runtime use
- **WHEN** the server instantiates a custom provider to handle a chat request
- **THEN** the API key is decrypted server-side and passed to the AI SDK provider factory

### Requirement: Create custom provider
The system SHALL provide an API endpoint to create a custom provider with name, base URL, API key, and format. All fields are required. The endpoint SHALL validate inputs and return the created provider (with masked key).

#### Scenario: Successful creation
- **WHEN** user submits a valid provider form
- **THEN** the provider is saved to DB and appears in the provider list

#### Scenario: Missing required field
- **WHEN** user submits without a base URL
- **THEN** the API returns a 400 error with field-level validation message

### Requirement: Update custom provider
The system SHALL allow updating provider name, base URL, API key, and format. If the API key field is empty or unchanged (masked value), the existing encrypted key SHALL be preserved.

#### Scenario: Update without changing key
- **WHEN** user edits the provider name but leaves the API key field as "sk-...xyz"
- **THEN** the name updates and the existing encrypted API key is preserved

#### Scenario: Update with new key
- **WHEN** user enters a new API key value
- **THEN** the new key is encrypted and replaces the old one

### Requirement: Delete custom provider
The system SHALL allow deleting a provider. Deleting a provider SHALL cascade-delete all associated custom models.

#### Scenario: Delete with models
- **WHEN** user deletes a provider that has 3 associated models
- **THEN** the provider and all 3 models are removed from the database

### Requirement: Add/remove models to provider
The system SHALL allow adding and removing models within a provider. Each model requires a model ID and display name.

#### Scenario: Add model
- **WHEN** user adds model ID "claude-3-opus" with display name "Claude 3 Opus" to a provider
- **THEN** the model appears in the provider's model list

#### Scenario: Remove model
- **WHEN** user removes a model from a provider
- **THEN** the model is deleted from `custom_model`

### Requirement: Toggle model enabled state
The system SHALL allow toggling individual models on/off. Only enabled models SHALL appear in the chat model selector.

#### Scenario: Disable model
- **WHEN** user toggles a model to disabled
- **THEN** the model no longer appears in the main chat model selector

### Requirement: Providers management UI
The Providers tab SHALL display a list of custom providers as cards. Each card shows provider name, format badge, and model count. Clicking a provider card SHALL expand/navigate to an edit form. An "Add Provider" button SHALL be available to create new providers.

#### Scenario: Empty state
- **WHEN** user has no custom providers
- **THEN** the page shows an empty state with guidance and an "Add Provider" button

#### Scenario: Provider list
- **WHEN** user has 2 providers configured
- **THEN** both providers appear as cards with their name, format, and model count
