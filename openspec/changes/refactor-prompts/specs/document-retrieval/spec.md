## ADDED Requirements

### Requirement: Tool always available
The system SHALL always include `retrieveDocuments` in the active tools list, regardless of document count.

#### Scenario: No documents in chat
- **WHEN** `retrieveDocuments` is called in a chat with no documents
- **THEN** tool returns a message indicating no documents are available and suggests uploading

#### Scenario: Documents exist
- **WHEN** `retrieveDocuments` is called in a chat with documents
- **THEN** tool performs normal retrieval

## ADDED Requirements

### Requirement: Document ID filtering
The system SHALL support filtering document retrieval by specific document IDs.

#### Scenario: Retrieve from specific documents
- **WHEN** `retrieveDocuments` is called with `documentIds` parameter
- **THEN** system only searches within the specified documents

#### Scenario: Retrieve from all documents
- **WHEN** `retrieveDocuments` is called without `documentIds` parameter
- **THEN** system searches across all ready documents in the chat

#### Scenario: Invalid document ID
- **WHEN** `retrieveDocuments` is called with a non-existent document ID
- **THEN** system returns empty results without error

### Requirement: Tool parameter schema
The system SHALL accept an optional `documentIds` array parameter in the `retrieveDocuments` tool.

#### Scenario: Parameter is optional
- **WHEN** tool schema is defined
- **THEN** `documentIds` parameter is marked as optional

#### Scenario: Parameter accepts array of strings
- **WHEN** `documentIds` is provided
- **THEN** it must be an array of document ID strings

### Requirement: Backward compatibility
The system SHALL maintain backward compatibility with existing tool calls that do not specify `documentIds`.

#### Scenario: Existing calls work unchanged
- **WHEN** `retrieveDocuments` is called with only `query` parameter
- **THEN** system behaves exactly as before, searching all documents

#### Scenario: Tool description updated
- **WHEN** tool description is displayed
- **THEN** it includes information about the optional `documentIds` parameter
