# Spec: RAG Retrieval

## Overview

During a chat, relevant document chunks are surfaced in two ways:
1. **Proactive retrieval** — on every request where the chat has ready documents, the last user message is used as a query to fetch top-5 chunks, which are injected into the system prompt before `streamText` is called.
2. **Tool retrieval** — the `retrieveDocuments` tool remains available for the LLM to call on follow-up turns when it needs to search with a different or more specific query.

## Functional Requirements

### Proactive Retrieval (server-side, before streamText)
- Triggered when `hasReadyDocuments(chatId)` is true
- Query: last user message text
- Embed query → cosine similarity search → top-5 chunks
- Inject into system prompt as a `ragContextPrompt` block:
  ```
  Relevant document excerpts:
  [fileName] (chunk N): <content>
  ...
  Use these excerpts to answer the user's question.
  ```

### Tool Interface
- Tool name: `retrieveDocuments`
- Input: `{ query: string }` — the search query
- Output: array of `{ content: string, fileName: string, chunkIndex: number }`

### Retrieval Logic
1. Embed the query using Zhipu `embedding-3`
2. Run cosine similarity search against `document_chunks` filtered by `chat_id`
3. Return top 5 chunks

### Availability
- Both proactive retrieval and the tool are only active when the chat has at least one document with `status: 'ready'`

## Non-functional Requirements

- Similarity search uses pgvector `<=>` operator (cosine distance)
- Index: `hnsw` on `embedding` column
