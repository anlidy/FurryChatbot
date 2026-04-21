import { tool } from "ai";
import { z } from "zod";
import type { DocsStatusResult } from "@/lib/ai/prompts/types";
import { getDocumentsByChat } from "@/lib/db/queries";

/**
 * Get detailed document status for a chat session (internal function)
 *
 * Returns structured information about all documents including their processing status.
 * This replaces the old hasReadyDocuments() boolean check with detailed status information.
 *
 * @param chatId - The chat session ID
 * @returns DocsStatusResult with document details and status counts
 */
export async function getDocsStatus(chatId: string): Promise<DocsStatusResult> {
  const documents = await getDocumentsByChat({ chatId });

  if (documents.length === 0) {
    return {
      hasDocuments: false,
      documents: [],
      readyCount: 0,
      processingCount: 0,
      failedCount: 0,
    };
  }

  // Map database status to our type
  const mappedDocuments = documents.map((doc) => ({
    id: doc.id,
    fileName: doc.fileName,
    status: (doc.status === "ready"
      ? "ready"
      : doc.status === "error"
        ? "failed"
        : "processing") as "ready" | "processing" | "failed",
    createdAt: doc.createdAt,
  }));

  // Calculate status counts
  const readyCount = mappedDocuments.filter((d) => d.status === "ready").length;
  const processingCount = mappedDocuments.filter(
    (d) => d.status === "processing"
  ).length;
  const failedCount = mappedDocuments.filter(
    (d) => d.status === "failed"
  ).length;

  return {
    hasDocuments: true,
    documents: mappedDocuments,
    readyCount,
    processingCount,
    failedCount,
  };
}

/**
 * Tool: Get document status
 *
 * Allows the model to query the status of uploaded documents in the current conversation.
 * Returns document IDs and filenames that can be used with retrieveDocuments tool.
 */
export const getDocumentsStatus = ({ chatId }: { chatId: string }) =>
  tool({
    description: `Get the status of all documents uploaded in this conversation.

Use this tool when:
- User asks about what documents are available
- You need to know document IDs or filenames for retrieval
- You want to check if documents are ready for searching

Returns:
- List of documents with their IDs, filenames, and processing status
- Status can be: "ready" (searchable), "processing" (not yet ready), or "failed" (error)
- Document IDs can be used with the retrieveDocuments tool to search specific documents`,
    inputSchema: z.object({}),
    execute: async () => {
      const status = await getDocsStatus(chatId);

      if (!status.hasDocuments) {
        return {
          message: "No documents have been uploaded to this conversation yet.",
          documents: [],
        };
      }

      return {
        message: `Found ${status.documents.length} document(s): ${status.readyCount} ready, ${status.processingCount} processing, ${status.failedCount} failed.`,
        documents: status.documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          status: doc.status,
          uploadedAt: doc.createdAt.toISOString(),
        })),
      };
    },
  });
