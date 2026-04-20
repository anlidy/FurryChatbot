# Proposal: feat-rag

## Summary

Add full RAG (Retrieval Augmented Generation) support to FurryChatbot. Users can upload PDF/DOCX files in a chat, which are parsed by LlamaCloud, chunked, embedded via Zhipu `embedding-3`, stored in pgvector, and retrieved automatically during conversation.

## Goals

- Parse PDF and DOCX documents using LlamaCloud Parse API
- Store document chunks with vector embeddings in pgvector (Postgres extension)
- Retrieve relevant chunks automatically via a tool when the LLM needs context
- Support document upload directly in the chat input (chat-scoped)
- Show upload/processing status in the UI
- Disable send button while document is ingesting; re-enable when `status: 'ready'`
- On first user message after upload, proactively retrieve relevant chunks and inject into system prompt; subsequent turns use the `retrieveDocuments` tool automatically

## Non-goals

- Global knowledge base / document management page
- User-configurable embedding model
- Multi-tenant shared document corpus
- Image extraction from documents

## Approach

1. Extend the file upload endpoint to accept PDF/DOCX, trigger async ingestion
2. Ingestion pipeline: LlamaCloud parse → markdown → chunk → Zhipu embed → pgvector store
3. Register a `retrieveDocuments` tool in the chat route; LLM calls it when needed
4. Extend the chat input UI to allow document file types
5. Show per-document ingestion status (pending / ready / error) in the chat
6. Disable send button while any document in the current message is ingesting; re-enable on `ready`
7. On first user message, proactively retrieve top-5 chunks matching the query and inject into system prompt; subsequent turns rely on the `retrieveDocuments` tool

## Tech Stack Additions

| Component | Technology |
|-----------|-----------|
| Document parsing | `@llamaindex/llama-cloud` — `client.parsing.parse()`, tier `agentic` |
| Vector store | pgvector extension on existing Postgres |
| Embedding model | Zhipu `embedding-3` (1024 dimensions, fixed) |
| ORM vector support | Drizzle raw SQL for similarity search (`<=>`) |

## Schema Changes

Two new tables:
- `document_resources` — one row per uploaded file, linked to a chat
- `document_chunks` — one row per chunk, with `vector(1024)` embedding column

## Key Constraints

- Embedding dimension is fixed at 1024 (Zhipu `embedding-3`). Switching models requires re-ingestion.
- `LLAMA_CLOUD_API_KEY` and `ZHIPU_API_KEY` must be added to environment variables.
- Documents are chat-scoped: retrieval filters by `chat_id`.
