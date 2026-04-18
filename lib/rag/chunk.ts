import { MarkdownNodeParser } from "@llamaindex/core/node-parser";
import { Document } from "@llamaindex/core/schema";

const parser = new MarkdownNodeParser();
const MAX_CHARS = 1000; // ~1500 tokens fallback

export function chunkMarkdown(markdown: string): string[] {
  const nodes = parser.getNodesFromDocuments([
    new Document({ text: markdown }),
  ]);
  const chunks: string[] = [];

  for (const node of nodes) {
    const text = node.getText();
    if (text.length <= MAX_CHARS) {
      chunks.push(text);
    } else {
      // fallback: split oversized nodes by paragraph
      const parts = text.split(/\n\n+/);
      let current = "";
      for (const part of parts) {
        if ((current + part).length > MAX_CHARS && current) {
          chunks.push(current.trim());
          current = part;
        } else {
          current = current ? `${current}\n\n${part}` : part;
        }
      }
      if (current.trim()) {
        chunks.push(current.trim());
      }
    }
  }

  return chunks.filter((c) => c.length > 0);
}
