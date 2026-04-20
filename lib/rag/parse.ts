import LlamaCloud from "@llamaindex/llama-cloud";

const client = new LlamaCloud({
  apiKey: process.env.LLAMA_CLOUD_API_KEY,
});

export async function parseDocument(
  buffer: ArrayBuffer,
  fileName: string
): Promise<string> {
  const file = new File([buffer], fileName);
  const fileObj = await client.files.create({ file, purpose: "parse" });

  const result = await client.parsing.parse({
    file_id: fileObj.id,
    version: "latest",
    tier: "fast",
    expand: ["markdown_full"],
  });
  return result.markdown_full ?? "";
}
