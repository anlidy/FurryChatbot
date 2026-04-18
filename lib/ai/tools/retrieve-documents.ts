import { tool } from "ai";
import { z } from "zod";
import { getDocumentsByChat, similaritySearch } from "@/lib/db/queries";
import { embedText } from "@/lib/rag/embed";

export const retrieveDocuments = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Retrieve relevant content from documents uploaded in this conversation.

Use cases:
1. User asks about specific information in the documents
2. User asks general/summary questions (e.g., "what is this document about", "summarize this")
3. System prompt doesn't provide sufficient relevant content

Important guidelines:
- Use short, specific keywords or phrases as queries, not complete sentences
- For general questions, call this tool multiple times with different query terms
- Each query should focus on one aspect, for example:
  * "main content" - get document overview
  * "key points" - get main arguments
  * "conclusion" - get summary content
  * "background" - get context information

Examples:
- User asks "what is this document about" → Query sequentially: "topic", "main content", "purpose"
- User asks "summarize this" → Query sequentially: "key points", "main conclusions", "highlights"
- User asks "what technologies are mentioned" → Query: "technology", "methods"`,
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Short keyword or phrase (recommended 2-5 words) to find relevant content. Avoid long sentences or combinations of multiple concepts."
        ),
    }),
    execute: async ({ query }) => {
      const embedding = await embedText(query);
      const chunks = await similaritySearch({ chatId, embedding });
      console.log(
        `[RAG Tool] Retrieved ${chunks.length} chunks for query: ${query}`
      );
      return chunks.map((c) => ({
        content: c.content,
        fileName: c.fileName,
        chunkIndex: c.chunkIndex,
      }));
    },
  });

export async function hasReadyDocuments(chatId: string): Promise<boolean> {
  const docs = await getDocumentsByChat({ chatId });
  const hasReady = docs.some((d) => d.status === "ready");
  console.log(
    `[RAG Debug] Chat ${chatId} has ${docs.length} documents, ${docs.filter((d) => d.status === "ready").length} ready`
  );
  return hasReady;
}
