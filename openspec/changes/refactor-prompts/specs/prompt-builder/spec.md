## ADDED Requirements

### Requirement: Static prompt construction
The system SHALL provide a `SystemPromptBuilder` class that constructs static system prompts from modular sections.

#### Scenario: Build basic static prompt
- **WHEN** `promptBuilder.build({ requestHints })` is called
- **THEN** system returns a string containing identity, tool guidelines, and location sections

#### Scenario: Sections are modular
- **WHEN** each section is implemented in separate files under `lib/ai/prompts/sections/`
- **THEN** each section can be tested and modified independently

### Requirement: Prompt sections
The system SHALL organize prompt content into the following sections:
- Identity: assistant personality and behavior
- Tool Guidelines: instructions for using available tools
- Location: user's geographic context
- Artifacts: instructions for document creation tools

Each section SHALL be wrapped with XML tags for clear structure.

#### Scenario: Identity section
- **WHEN** identity section is built
- **THEN** it contains the assistant's core personality and response style wrapped in `<identity>` tags

#### Scenario: Tool guidelines section
- **WHEN** tool guidelines section is built
- **THEN** it contains usage instructions for all available tools wrapped in `<tool_guidelines>` tags

#### Scenario: Location section
- **WHEN** location section is built
- **THEN** it contains user's geographic context wrapped in `<location>` tags

#### Scenario: Artifacts section
- **WHEN** artifacts section is built
- **THEN** it contains document creation instructions wrapped in `<artifacts>` tags

### Requirement: Extensibility
The system SHALL support adding new prompt sections without modifying the builder core logic.

#### Scenario: Add user preferences section
- **WHEN** a new section function is created
- **THEN** it can be conditionally added to the builder without changing existing sections

#### Scenario: Add project context section
- **WHEN** project context is provided
- **THEN** builder can include it as an additional section
