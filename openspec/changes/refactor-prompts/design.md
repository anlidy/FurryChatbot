## Context

The current system uses `systemPrompt()` function in `lib/ai/prompts.ts` to build prompts, concatenating static rules (identity, tool guidelines) and dynamic state (document info, retrieval content) into a single string for every conversation. This causes:
- Static content is rebuilt repeatedly, wasting computation
- Document status info embedded in static prompt cannot reflect real-time changes
- Prompt logic scattered across `prompts.ts` and `route.ts`
- Difficult to extend (e.g., user preferences, project context)

Constraints:
- Maintain AI SDK message format standards
- Don't break existing tool invocation logic

## Goals / Non-Goals

**Goals:**
- Static system prompt built once, dynamic info injected via independent system messages
- Document status info injected immediately after document upload
- Modular prompts with clear responsibilities
- Support filtering retrieval by document ID
- `retrieveDocuments` tool always available, simplifying logic

**Non-Goals:**
- No complex prompt version management
- No user preferences or project context implementation (just reserve extension points)
- No backward compatibility, switch directly to new implementation

## Decisions

### 1. Static vs Dynamic Separation

Use `SystemPromptBuilder` to build static prompts, inject dynamic info as independent `{ role: "system" }` messages into message stream.

- AI SDK supports multiple system messages
- Static prompt built only once
- Dynamic messages injected on demand

### 2. Document Status Representation

`getDocsStatus()` returns structured object:

```typescript
{
  hasDocuments: boolean,
  documents: Array<{
    id: string,
    fileName: string,
    status: 'processing' | 'ready' | 'failed',
    createdAt: Date
  }>,
  readyCount: number,
  processingCount: number,
  failedCount: number
}
```

Model can provide accurate responses based on document status, supports retrieval by document ID.

### 3. Dynamic Message Injection Timing

**Inject immediately after document upload**: Inject document status in the first message after document upload processing completes.

Simple and direct, no complex deduplication logic needed.

### 4. retrieveDocuments Tool Strategy

**Tool always available**: No longer dynamically add/remove tool based on document count.

- Simplify `activeTools` logic
- Tool internally checks if documents are available for retrieval
- If no documents, return friendly prompt

### 5. retrieveDocuments Tool Enhancement

Add optional `documentIds` parameter:

```typescript
{
  query: string,
  documentIds?: string[]  // Optional, limit retrieval scope
}
```

Support retrieval from specific documents, improving precision.

### 6. XML Tags for Prompt Sections

Wrap each prompt section with XML tags for better structure and model understanding:

- Static sections: `<identity>`, `<tool_guidelines>`, `<location>`, `<artifacts>`
- Dynamic sections: `<document_status>`, `<retrieved_context>`

Example:
```
<identity>
You are a friendly assistant...
</identity>

<document_status>
You have access to 2 documents:
- report.pdf (ready)
- data.xlsx (processing)
</document_status>
```

Benefits:
- Clearer section boundaries for the model
- Easier to parse and debug prompts
- Consistent with common LLM prompt engineering practices

## Risks / Trade-offs

**Risk**: `retrieveDocuments` always available may lead to erroneous calls when no documents exist
→ **Mitigation**: Tool internally returns friendly prompt, guiding user to upload documents

**Trade-off**: Dynamic message injection increases message count
→ **Benefit**: Saves tokens from rebuilding static prompts, more efficient overall

## Implementation Plan

1. **Create new modules**
   - Implement `lib/ai/prompts/builder.ts` and sections
   - Implement `getDocsStatus()` and `buildDocsStatusMessage()`
   - Enhance `retrieveDocuments` tool

2. **Rewrite route.ts**
   - Remove `hasReadyDocuments()` calls
   - Use `promptBuilder.build()` to build static prompt
   - Implement document status message injection logic
   - Remove `activeTools` conditional logic, always include `retrieveDocuments`

3. **Clean up old code**
   - Delete `systemPrompt()` function from `lib/ai/prompts.ts`
   - Keep `ragContextPrompt()` for proactive retrieval
   - Update all import paths

## Open Questions

None
