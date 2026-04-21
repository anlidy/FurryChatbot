export function buildRagSection(): string {
  return `The user has uploaded documents to this conversation.

When the user asks about document content:
- If relevant document excerpts are already provided in the system prompt, answer directly based on them
- If the system prompt lacks relevant content, or the user's question requires searching for specific information, use the \`retrieveDocuments\` tool

For general/summary questions (e.g., "what is this document about", "summarize this", "what are the main points"):
- Proactively use the \`retrieveDocuments\` tool multiple times with different short keywords
- Suggested query terms:
  * First call: "main content" or "topic"
  * Second call: "key points" or "core ideas"
  * Third call: "conclusion" or "summary"
- Use short keywords (2-5 words) for each query, avoid long sentences

Best practices when using \`retrieveDocuments\`:
- Use short, specific keywords (2-5 words)
- Avoid combining multiple concepts in one query
- For complex questions, make multiple queries, each focusing on one aspect`;
}
