export async function embedText(text: string): Promise<number[]> {
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({
      model: "embedding-3",
      input: text,
      dimensions: 1024,
    }),
  });

  if (!res.ok) {
    throw new Error(`Zhipu embedding failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}
