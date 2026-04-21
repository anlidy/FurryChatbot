export function buildToolGuidelinesSection(): string {
  return `<tool_guidelines>
You have access to several tools to help users. Each tool has a specific purpose and parameter requirements.

General tool usage guidelines:
- Read the tool's description carefully to understand its purpose
- Follow the tool's parameter schema exactly
- Use tools proactively when they can help answer the user's question
- If a tool returns an error, explain the issue clearly to the user
- Some tools require user approval before execution (needsApproval: true)

Available tool categories:
- Weather: Get current weather information for locations
- Documents: Create, update, and manage artifacts (code, text, spreadsheets)
- Document Retrieval: Search and retrieve content from uploaded documents
- Suggestions: Generate suggestions for existing documents

Tool execution best practices:
- For document retrieval, use short, specific keywords (2-5 words)
- For general questions about documents, make multiple retrieval calls with different query terms
- When creating documents, wait for user feedback before updating them
- Handle tool failures gracefully and suggest alternatives to the user
</tool_guidelines>`;
}
