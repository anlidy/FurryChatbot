# Design: feat-rag

## Architecture Overview

```
Upload (PDF/DOCX)
      │
      ▼
api/files/upload/route.ts
      ├─► Vercel Blob (store original file)
      └─► lib/rag/ingest.ts (async)
                │
                ▼
          LlamaCloud Parse
          (markdown_full, tier: agentic)
                │
                ▼
          chunk by paragraph (~500 tokens)
                │
                ▼
          Zhipu embedding-3 (2048d)
                │
                ▼
          pgvector: document_chunks
```

```
Chat message
      │
      ▼
api/chat/route.ts
      │
      ├─ hasReadyDocuments(chatId)?
      │       │ yes
      │       ▼
      │  proactiveRetrieval(chatId, lastUserMessage)
      │       │  embed query → top-5 chunks
      │       ▼
      │  inject chunks into system prompt (ragContextPrompt)
      │       │
      │       ▼
      │  streamText
      │       │  tools: { retrieveDocuments }  ← for follow-up turns
      │       ▼ (LLM calls tool when needed)
      │  lib/ai/tools/retrieve-documents.ts
      │       │  embed query → cosine search WHERE chat_id=?
      │       ▼
      │  top-5 chunks → LLM generates answer
      │
      └─ no docs → streamText without RAG
```

## Database Schema

```sql
-- Enable extension (migration)
CREATE EXTENSION IF NOT EXISTS vector;

-- One row per uploaded document
CREATE TABLE document_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- 'pdf' | 'docx'
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'ready' | 'error'
  created_at TIMESTAMP DEFAULT NOW()
);

-- One row per chunk
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES document_resources(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL,  -- denormalized for fast filtering
  content TEXT NOT NULL,
  embedding vector(1024),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

## New Files

| File | Responsibility |
|------|---------------|
| `lib/rag/parse.ts` | LlamaCloud upload → parse → return markdown |
| `lib/rag/chunk.ts` | Split markdown via `MarkdownNodeParser` from `@llamaindex/core/node-parser` |
| `lib/rag/embed.ts` | Zhipu `embedding-3` API call |
| `lib/rag/ingest.ts` | Orchestrate parse → chunk → embed → store |
| `lib/ai/tools/retrieveDocuments.ts` | Tool: embed query → pgvector search → return chunks |

## Modified Files

| File | Change |
|------|--------|
| `lib/db/schema.ts` | Add `documentResources`, `documentChunks` tables |
| `lib/db/queries.ts` | Add `insertDocumentChunks`, `similaritySearch`, `getDocumentsByChat` |
| `app/(chat)/api/files/upload/route.ts` | Accept PDF/DOCX, trigger `ingest()`, return resource id + status |
| `app/(chat)/api/chat/route.ts` | Register `retrieveDocuments` tool |
| `components/multimodal-input.tsx` | Allow `.pdf`, `.docx` in file picker |

## Chunking Strategy

- Use `MarkdownNodeParser` from `@llamaindex/core/node-parser`
- Splits by markdown heading structure — preserves heading context in each chunk
- `@llamaindex/core` is already an indirect dependency of `@llamaindex/llama-cloud`, no extra install cost
- Size fallback: if a single node exceeds ~1500 tokens, split further by paragraph

## Retrieval Strategy

- Tool input: `{ query: string }`
- Embed query with Zhipu `embedding-3`
- `SELECT content FROM document_chunks WHERE chat_id = $1 ORDER BY embedding <=> $2 LIMIT 5`
- Return chunks as tool result; LLM synthesizes answer

## Frontend: Send Button Gating

When a document file is attached to the current message:
- Upload starts → `status: 'pending'` → send button disabled
- Frontend polls `GET /api/documents/status?chatId=&resourceId=` every 2s
- `status: 'ready'` → send button re-enabled
- `status: 'error'` → show error, remove attachment, re-enable send

```
User attaches PDF
      │
      ▼
POST /api/files/upload → { resourceId, status: 'pending' }
      │
      ▼
multimodal-input: disable send, store resourceId
      │
      ▼
poll GET /api/documents/status?resourceId=xxx every 2s
      │
      ├─ pending → keep polling
      ├─ ready   → enable send ✓
      └─ error   → show error, remove file
```

## Proactive Retrieval

On each chat request where `hasRagDocs = true`, before calling `streamText`:
1. Extract the last user message text as the query
2. Call `similaritySearch(chatId, embed(query), 5)`
3. Inject results into system prompt as `ragContextPrompt`

This ensures the model has relevant context even on the first message, without waiting for it to decide to call the tool.

The `retrieveDocuments` tool remains registered for follow-up turns where the model needs to search with a different query.

## Modified Files (additions)

| File | Change |
|------|--------|
| `app/(chat)/api/documents/status/route.ts` | New: `GET` endpoint returning `{ status }` for a resourceId |
| `lib/ai/prompts.ts` | Add `ragContextPrompt` that injects retrieved chunks |
| `app/(chat)/api/chat/route.ts` | Add proactive retrieval before `streamText` |
| `components/multimodal-input.tsx` | Poll status, gate send button on document readiness |


```
LLAMA_CLOUD_API_KEY=
ZHIPU_API_KEY=
```
