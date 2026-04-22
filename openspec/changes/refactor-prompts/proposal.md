## Why

The current prompt system mixes static rules and dynamic session state together, rebuilding the entire system prompt for every conversation. This leads to scattered logic and maintenance difficulties. We need to refactor to a layered architecture: static system prompt + dynamic message injection, improving maintainability and token efficiency.

## What Changes

- Create `SystemPromptBuilder` class to build static system prompts (identity, tool guidelines, behavior rules)
- Split prompts by function into `lib/ai/prompts/sections/` directory
- Wrap each prompt section with XML tags (e.g., `<identity>`, `<document_status>`) for better structure
- Add `getDocsStatus()` function to replace `hasRagDocs` boolean, returning detailed document status
- Add `buildDocsStatusMessage()` function to dynamically inject document status as independent system messages after document upload
- Modify `retrieveDocuments` tool to support filtering by document ID
- Refactor message construction logic in `route.ts`, separating static and dynamic parts
- `retrieveDocuments` tool is always available, no longer dynamically added/removed based on document count

## Capabilities

### New Capabilities
- `prompt-builder`: Layered system prompt construction, supporting separation of static and dynamic parts
- `docs-status-tracking`: Track and display document status information in conversations
- `dynamic-message-injection`: Dynamically inject document status and retrieval content into message stream

### Modified Capabilities
- `document-retrieval`: Enhanced retrieval tool supporting filtering by document ID

## Impact

- `lib/ai/prompts.ts`: Delete and refactor into modular structure, split into `prompts/` directory
- `lib/ai/tools/rag/retrieve-documents.ts`: Modify tool parameters to support document ID filtering
- `app/(chat)/api/chat/route.ts`: Completely rewrite message construction logic using new builder and dynamic injection
- **BREAKING**: Delete old `systemPrompt()` function, switch directly to new implementation
