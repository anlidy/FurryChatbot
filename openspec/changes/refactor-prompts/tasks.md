## 1. Create prompt module structure

- [x] 1.1 Create `lib/ai/prompts/` directory and subdirectory structure
- [x] 1.2 Create `lib/ai/prompts/types.ts` defining types (RequestHints, DocsStatusResult, PromptContext)
- [x] 1.3 Create `lib/ai/prompts/sections/` directory

## 2. Implement prompt sections

- [x] 2.1 Create `lib/ai/prompts/sections/identity.ts` implementing `buildIdentitySection()` (wrap with `<identity>` tags)
- [x] 2.2 Create `lib/ai/prompts/sections/location.ts` implementing `buildLocationSection()` (wrap with `<location>` tags)
- [x] 2.3 Create `lib/ai/prompts/sections/tools.ts` implementing `buildToolGuidelinesSection()` (wrap with `<tool_guidelines>` tags)
- [x] 2.4 Create `lib/ai/prompts/sections/artifacts.ts` exporting artifacts prompt (wrap with `<artifacts>` tags)
- [x] 2.5 Create `lib/ai/prompts/sections/rag.ts` implementing `buildRagSection()` (no tags, only used in static prompt)

## 3. Implement SystemPromptBuilder

- [x] 3.1 Create `lib/ai/prompts/builder.ts` implementing `SystemPromptBuilder` class
- [x] 3.2 Implement `build()` method, assembling sections in order
- [x] 3.3 Export `promptBuilder` singleton instance

## 4. Implement document status tracking

- [x] 4.1 Create `lib/ai/tools/rag/` directory
- [x] 4.2 Create `lib/ai/tools/rag/get-docs-status.ts` implementing `getDocsStatus()` function
- [x] 4.3 Define `DocsStatusResult` type (if not defined in types.ts)
- [x] 4.4 Implement status statistics logic (readyCount, processingCount, failedCount)

## 5. Implement dynamic message construction

- [x] 5.1 Create `lib/ai/prompts/dynamic-messages.ts`
- [x] 5.2 Implement `buildDocsStatusMessage()` function to generate document status message (wrap with `<document_status>` tags)
- [x] 5.3 Move `ragContextPrompt()` from `prompts.ts` to `dynamic-messages.ts` (wrap with `<retrieved_context>` tags)

## 6. Enhance retrieveDocuments tool

- [x] 6.1 Modify `lib/ai/tools/retrieve-documents.ts` inputSchema, adding optional `documentIds` parameter
- [x] 6.2 Modify `execute` function to support filtering by documentIds
- [x] 6.3 Add friendly prompt logic when no documents exist
- [x] 6.4 Update tool description explaining documentIds parameter usage

## 7. Refactor route.ts message construction logic

- [x] 7.1 Import `promptBuilder`, `getDocsStatus`, `buildDocsStatusMessage`
- [x] 7.2 Remove `hasReadyDocuments()` calls and related logic
- [x] 7.3 Use `promptBuilder.build()` to build static system prompt
- [x] 7.4 Call `getDocsStatus(id)` to get document status
- [x] 7.5 If documents exist, call `buildDocsStatusMessage()` and inject into message stream
- [x] 7.6 Keep proactive retrieval logic, inject results as independent system message
- [x] 7.7 Remove `activeTools` conditional logic, always include all tools (including `retrieveDocuments`)
- [x] 7.8 Ensure message order: static prompt → history → docs status (if any) → proactive context (if any) → user message

## 8. Testing and validation

- [ ] 8.1 Test normal conversation without documents (should not have document status message)
- [ ] 8.2 Test calling retrieveDocuments tool without documents (should return friendly prompt)
- [ ] 8.3 Test conversation after uploading documents (should auto-inject document status message)
- [ ] 8.4 Test document processing status display (processing state)
- [ ] 8.5 Test document ready status display (ready state)
- [ ] 8.6 Test proactive retrieval functionality (proactive context injection)
- [ ] 8.7 Test retrieveDocuments tool documentIds parameter
- [ ] 8.8 Test multiple documents scenario

**Note:** These tests require runtime verification by the user. The implementation is complete and compiles without errors.

## 9. Clean up old code

- [x] 9.1 Delete `systemPrompt()` function from `lib/ai/prompts.ts`
- [x] 9.2 Delete `hasReadyDocuments()` function from `lib/ai/prompts.ts` (if in this file)
- [x] 9.3 Delete `hasReadyDocuments()` function from `lib/ai/tools/retrieve-documents.ts`
- [x] 9.4 Keep and move `ragContextPrompt()` to `dynamic-messages.ts`
- [x] 9.5 Update all import paths
- [x] 9.6 Add code comments explaining new architecture
- [x] 9.7 Verify no remaining old function calls
