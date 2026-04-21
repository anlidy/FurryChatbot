## ADDED Requirements

### Requirement: Provider format-specific thinking configuration
The system SHALL configure thinking mode parameters based on the provider's format (Anthropic or OpenAI).

#### Scenario: Anthropic provider thinking configuration
- **WHEN** thinking mode is enabled for an Anthropic format provider
- **THEN** the system configures providerOptions with anthropic.thinking.type set to "enabled"
- **AND** anthropic.thinking.budgetTokens set to 10000

#### Scenario: OpenAI provider thinking configuration
- **WHEN** thinking mode is enabled for an OpenAI format provider
- **THEN** the system configures providerOptions with thinking.type set to "enabled"

#### Scenario: Unsupported provider format
- **WHEN** thinking mode is requested for a provider format other than Anthropic or OpenAI
- **THEN** the system returns an HTTP 400 error
- **AND** the error message indicates the provider doesn't support thinking mode

### Requirement: Reasoning middleware application
The system SHALL apply reasoning extraction middleware when thinking mode is enabled.

#### Scenario: Middleware wrapping
- **WHEN** thinking mode is enabled for any supported provider
- **THEN** the model is wrapped with extractReasoningMiddleware
- **AND** the middleware uses tagName "thinking"

### Requirement: Remove model ID-based reasoning detection
The system SHALL NOT infer thinking mode from model ID naming patterns.

#### Scenario: Model ID suffix ignored
- **WHEN** a model ID contains "-thinking" suffix
- **THEN** the system does NOT automatically enable thinking mode
- **AND** thinking mode is only enabled based on explicit mode parameter

#### Scenario: Model ID keyword ignored
- **WHEN** a model ID contains "reasoning" keyword
- **THEN** the system does NOT automatically enable thinking mode
- **AND** thinking mode is only enabled based on explicit mode parameter
