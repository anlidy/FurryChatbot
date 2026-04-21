## ADDED Requirements

### Requirement: Document status retrieval
The system SHALL provide a `getDocsStatus()` function that returns detailed status information for all documents in a chat session.

#### Scenario: Get status for chat with documents
- **WHEN** `getDocsStatus(chatId)` is called for a chat with uploaded documents
- **THEN** system returns an object with `hasDocuments: true`, array of document details, and status counts

#### Scenario: Get status for chat without documents
- **WHEN** `getDocsStatus(chatId)` is called for a chat with no documents
- **THEN** system returns an object with `hasDocuments: false` and empty arrays

#### Scenario: Document details include metadata
- **WHEN** document status is retrieved
- **THEN** each document includes `id`, `fileName`, `status`, and `createdAt` fields

### Requirement: Document status types
The system SHALL recognize three document status types: `processing`, `ready`, and `failed`.

#### Scenario: Ready documents are available for retrieval
- **WHEN** a document has status `ready`
- **THEN** it can be searched using the `retrieveDocuments` tool

#### Scenario: Processing documents are not searchable
- **WHEN** a document has status `processing`
- **THEN** system should inform user to wait before searching

#### Scenario: Failed documents are reported
- **WHEN** a document has status `failed`
- **THEN** system should inform user that the document could not be processed

### Requirement: Status counts
The system SHALL provide aggregate counts for document statuses: `readyCount`, `processingCount`, and `failedCount`.

#### Scenario: Count ready documents
- **WHEN** status is retrieved for a chat with 2 ready and 1 processing document
- **THEN** `readyCount` is 2 and `processingCount` is 1
