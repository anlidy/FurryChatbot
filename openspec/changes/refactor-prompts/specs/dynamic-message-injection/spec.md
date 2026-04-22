## ADDED Requirements

### Requirement: Document status message construction
The system SHALL provide a `buildDocsStatusMessage()` function that constructs a human-readable document status message for injection into the message stream.

All document status messages SHALL be wrapped with `<document_status>` XML tags.

#### Scenario: Build message with ready documents
- **WHEN** `buildDocsStatusMessage()` is called with documents in ready state
- **THEN** message includes document list with status text and usage instructions, wrapped in `<document_status>` tags

#### Scenario: Build message with processing documents
- **WHEN** `buildDocsStatusMessage()` is called with documents in processing state
- **THEN** message includes document list with status text and wait instructions, wrapped in `<document_status>` tags

#### Scenario: Build message with mixed statuses
- **WHEN** `buildDocsStatusMessage()` is called with both ready and processing documents
- **THEN** message clearly distinguishes which documents are available and which are not

### Requirement: Dynamic message injection timing
The system SHALL inject document status messages as independent `{ role: "system" }` messages after document upload.

#### Scenario: Inject after document upload
- **WHEN** user uploads a document and sends their next message
- **THEN** system injects document status message before processing the user message

#### Scenario: Inject on status change
- **WHEN** document status changes (e.g., from processing to ready) and user sends a message
- **THEN** system injects updated status message

### Requirement: Proactive context injection
The system SHALL inject retrieved document excerpts as independent system messages when proactive retrieval is performed.

All retrieved context SHALL be wrapped with `<retrieved_context>` XML tags.

#### Scenario: Inject retrieved content
- **WHEN** system performs proactive similarity search and finds relevant chunks
- **THEN** system injects a message with document excerpts wrapped in `<retrieved_context>` tags before the user message

#### Scenario: Skip injection for vague queries
- **WHEN** user query is too vague for proactive retrieval
- **THEN** system does not inject retrieved content, relying on tool calls instead

### Requirement: Message structure
The system SHALL maintain proper message ordering: static system prompt, conversation history, dynamic system messages, current user message.

#### Scenario: Correct message order
- **WHEN** building messages array for AI model
- **THEN** order is: static system prompt → history → docs status (if needed) → proactive context (if any) → user message

#### Scenario: Multiple dynamic messages
- **WHEN** both document status and proactive context need injection
- **THEN** document status message comes before proactive context message
