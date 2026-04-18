# Tasks: feat-rag

## 1. Database & Schema

- [x] Add pgvector extension to a new migration (`CREATE EXTENSION IF NOT EXISTS vector`)
- [x] Add `documentResources` and `documentChunks` tables to `lib/db/schema.ts`
- [x] Add `hnsw` index on `document_chunks.embedding`
- [x] Run `pnpm db:generate && pnpm db:migrate`
- [x] Add DB query functions to `lib/db/queries.ts`:
  - `insertDocumentResource`
  - `updateDocumentResourceStatus`
  - `insertDocumentChunks`
  - `getDocumentsByChat`
  - `similaritySearch(chatId, embedding, limit)`

## 2. RAG Pipeline

- [x] `lib/rag/parse.ts` — LlamaCloud upload + parse, return markdown string
- [x] `lib/rag/chunk.ts` — split markdown via `MarkdownNodeParser` from `@llamaindex/core/node-parser`
- [x] `lib/rag/embed.ts` — Zhipu `embedding-3` API call, return `number[]`
- [x] `lib/rag/ingest.ts` — orchestrate parse → chunk → embed → store, update status

## 3. File Upload Endpoint

- [x] Extend `app/(chat)/api/files/upload/route.ts`:
  - Accept `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Increase size limit to 20MB for documents
  - Create `document_resources` row with `status: 'pending'`
  - Call `ingest()` after returning response (fire-and-forget via `after`)
  - Return `{ url, resourceId, status }`

## 4. Retrieval Tool

- [x] `lib/ai/tools/retrieve-documents.ts` — embed query, run similarity search, return top-5 chunks
- [x] Register tool in `app/(chat)/api/chat/route.ts`
- [x] Only expose tool when chat has at least one `ready` document

## 5. Status Polling Endpoint

- [x] `app/(chat)/api/documents/status/route.ts` — `GET ?resourceId=` returns `{ status }` from `document_resources`

## 6. Frontend

- [x] `components/multimodal-input.tsx` — add `.pdf`, `.docx` to accepted file types
- [x] Pass `chatId` to upload endpoint so documents are chat-scoped
- [x] After document upload, store `resourceId` and poll `/api/documents/status` every 2s
- [x] Disable send button while any attached document has `status: 'pending'`
- [x] On `status: 'error'`: show error toast, remove attachment, re-enable send

## 7. Proactive Retrieval

- [x] `lib/ai/prompts.ts` — add `ragContextPrompt(chunks)` that formats retrieved chunks into system prompt
- [x] `app/(chat)/api/chat/route.ts` — before `streamText`, if `hasRagDocs`, embed last user message and run `similaritySearch`, inject result via `ragContextPrompt`

## 8. Environment & Config

- [x] Add `LLAMA_CLOUD_API_KEY` and `ZHIPU_API_KEY` to `.env.example`
- [x] Install `@llamaindex/llama-cloud` and `@llamaindex/core` packages

## Notes

- Vector dimension changed from 2048 → 1024 (pgvector index limit is 2000 dims)
- Zhipu `embedding-3` called with `dimensions: 1024` parameter
- Index type: `hnsw` (supports up to 2000 dims, better recall than ivfflat)
