/**
 * Dynamic message construction utilities
 *
 * These functions build dynamic system messages that are injected into the message stream
 * based on current session state (document status, retrieved context).
 *
 * Unlike static prompts, these messages change based on:
 * - Document upload/processing status
 * - Proactive retrieval results
 * - User query context
 */

import type { DocsStatusResult } from "./types";

/**
 * Build a document status message for injection into the message stream
 *
 * This message informs the AI about available documents and their processing status.
 * Injected as an independent system message after document upload.
 */
export function buildDocsStatusMessage(status: DocsStatusResult): string {
  if (!status.hasDocuments) {
    return "";
  }

  const parts: string[] = ["<document_status>"];

  // Summary
  const totalDocs = status.documents.length;
  parts.push(
    `You have access to ${totalDocs} document${totalDocs > 1 ? "s" : ""}:`
  );
  parts.push("");

  // Document list
  for (const doc of status.documents) {
    const statusText =
      doc.status === "ready"
        ? "✓ ready"
        : doc.status === "processing"
          ? "⏳ processing"
          : "✗ failed";
    parts.push(`- ${doc.fileName} (${statusText})`);
  }
  parts.push("");

  // Usage instructions based on status
  if (status.readyCount > 0) {
    parts.push(
      `${status.readyCount} document${status.readyCount > 1 ? "s are" : " is"} ready for retrieval. Use the \`retrieveDocuments\` tool to search for specific information. Use \`getDocumentsStatus\` tool to get document IDs and filenames.`
    );
  }

  if (status.processingCount > 0) {
    parts.push(
      `${status.processingCount} document${status.processingCount > 1 ? "s are" : " is"} still processing. Please wait before searching ${status.processingCount > 1 ? "them" : "it"}.`
    );
  }

  if (status.failedCount > 0) {
    parts.push(
      `${status.failedCount} document${status.failedCount > 1 ? "s" : ""} could not be processed. You may ask the user to re-upload ${status.failedCount > 1 ? "them" : "it"}.`
    );
  }

  parts.push("</document_status>");

  return parts.join("\n");
}

/**
 * Build a retrieved context message for proactive document retrieval
 * Wraps document excerpts with XML tags for clear structure
 */
export function ragContextPrompt(
  chunks: Array<{ content: string; fileName: string; chunkIndex: number }>
): string {
  const excerpts = chunks
    .map(
      (c, idx) =>
        `### Document Excerpt ${idx + 1} [Source: ${c.fileName}, Chunk ${c.chunkIndex}]\n${c.content}`
    )
    .join("\n\n");

  return `<retrieved_context>
Below are excerpts from the user's uploaded documents. Please answer the user's question based on these excerpts:

${excerpts}

Answer the user's question based on the above document content. If the excerpts are insufficient to answer the question, indicate that more information is needed.
</retrieved_context>`;
}
