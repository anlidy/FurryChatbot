# Spec: RAG Document Ingestion

## Overview

When a user uploads a PDF or DOCX file in a chat, the system parses, chunks, embeds, and stores it so it can be retrieved during conversation.

## Functional Requirements

### Upload
- The file upload endpoint accepts `.pdf` and `.docx` in addition to existing image types
- Max file size: 20MB for documents
- On upload: store original file in Vercel Blob, create a `document_resources` row with `status: 'pending'`, trigger ingestion asynchronously
- Return `{ resourceId, status: 'pending' }` immediately so the UI can show progress

### Status Polling
- `GET /api/documents/status?resourceId=<id>` returns `{ status: 'pending' | 'ready' | 'error' }`
- Frontend polls every 2s after upload until `ready` or `error`
- Send button is disabled while any attached document has `status: 'pending'`
- On `error`: show error message, remove the attachment, re-enable send

### Ingestion Pipeline
1. Upload file bytes to LlamaCloud via `client.files.create({ purpose: 'parse' })`
2. Parse with `client.parsing.parse({ tier: 'agentic', expand: ['markdown_full'] })`
3. Split resulting markdown into chunks (~500 tokens, paragraph boundaries)
4. Embed each chunk via Zhipu `embedding-3` (1024 dimensions)
5. Batch-insert chunks into `document_chunks`
6. Update `document_resources.status` to `'ready'` (or `'error'` on failure)

### Error Handling
- If LlamaCloud parse fails: set status `'error'`, store error message
- If embedding fails: set status `'error'`
- Partial ingestion is not persisted (all-or-nothing per document)

## Non-functional Requirements

- Ingestion runs server-side after upload response is returned
- No retry logic in v1
