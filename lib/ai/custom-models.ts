import "server-only";

import { getEnabledCustomModelsByUserId } from "@/lib/db/queries";
import type { ChatModel } from "./models";

/**
 * Retrieve enabled custom chat models for a user and convert them to `ChatModel` objects.
 *
 * Each returned `ChatModel` includes an `id` formatted as `<provider.id>/<model.modelId>`, `name` from the model's display name, `provider` from the provider name, and `description` set to `via <provider.name>`.
 *
 * @param userId - The ID of the user whose enabled custom models to fetch
 * @returns An array of `ChatModel` objects representing the user's enabled custom models
 */
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
