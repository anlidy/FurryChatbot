import "server-only";

import { getEnabledCustomModelsByUserId } from "@/lib/db/queries";
import type { ChatModel } from "./models";

export async function getCustomModelsForUser(
  userId: string
): Promise<ChatModel[]> {
  const rows = await getEnabledCustomModelsByUserId({ userId });

  return rows.map(({ model, provider }) => ({
    id: `${provider.id}/${model.modelId}`,
    name: model.displayName,
    provider: provider.name,
    description: `via ${provider.name}`,
  }));
}
