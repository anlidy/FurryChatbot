## ADDED Requirements

### Requirement: Accept mode parameter
The system SHALL accept a mode parameter in chat API requests to control thinking behavior.

#### Scenario: Mode parameter validation
- **WHEN** a chat request is received
- **THEN** the mode parameter is validated as either "fast" or "thinking"
- **AND** defaults to "fast" if not provided

#### Scenario: Fast mode request
- **WHEN** mode parameter is "fast"
- **THEN** the system processes the message without thinking mode
- **AND** does not apply reasoning middleware
- **AND** does not configure thinking-specific provider options

#### Scenario: Thinking mode request
- **WHEN** mode parameter is "thinking"
- **THEN** the system enables thinking mode for the request
- **AND** applies reasoning middleware
- **AND** configures provider-specific thinking options

### Requirement: All tools available in both modes
The system SHALL make all tools available regardless of thinking mode.

#### Scenario: Fast mode tool availability
- **WHEN** processing a message in fast mode
- **THEN** all tools are available including getWeather, createDocument, updateDocument, requestSuggestions, and retrieveDocuments

#### Scenario: Thinking mode tool availability
- **WHEN** processing a message in thinking mode
- **THEN** all tools are available including getWeather, createDocument, updateDocument, requestSuggestions, and retrieveDocuments

### Requirement: Reasoning content transmission
The system SHALL include reasoning content in the response stream when thinking mode is enabled.

#### Scenario: Thinking mode response stream
- **WHEN** thinking mode is enabled
- **THEN** the response stream includes sendReasoning set to true
- **AND** reasoning parts are transmitted to the client

#### Scenario: Fast mode response stream
- **WHEN** fast mode is active
- **THEN** the response stream includes sendReasoning set to false
- **AND** reasoning parts are not transmitted to the client

### Requirement: Provider validation for thinking mode
The system SHALL validate that the selected provider supports thinking mode before processing.

#### Scenario: Supported provider
- **WHEN** thinking mode is requested with Anthropic or OpenAI provider
- **THEN** the request proceeds normally

#### Scenario: Unsupported provider
- **WHEN** thinking mode is requested with a provider other than Anthropic or OpenAI
- **THEN** the system returns HTTP 400 error
- **AND** the error message states "This provider doesn't support thinking mode"
