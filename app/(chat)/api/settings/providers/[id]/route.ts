import { auth } from "@/app/(auth)/auth";
import {
  deleteCustomProvider,
  getCustomProviderById,
  updateCustomProvider,
} from "@/lib/db/queries";
import { encrypt, maskApiKey } from "@/lib/encryption";
import { ChatbotError } from "@/lib/errors";
import { updateProviderSchema } from "@/lib/settings-schemas";

/**
 * Update a custom provider owned by the authenticated user.
 *
 * Validates the JSON request body against `updateProviderSchema`, applies updates to the provider identified by `params.id`, conditionally encrypts a new `apiKey` when provided (leaving it unchanged when the value is empty or contains `"..."`), persists the changes, and returns the updated provider with its `apiKey` masked.
 *
 * Returns error responses when the caller is unauthenticated, when the provider does not exist or is not owned by the user, when the request body is not valid JSON, or when schema validation fails.
 *
 * @param params - Route params promise resolving to an object with `id` (the provider id to update)
 * @returns A Response whose JSON body is the updated provider object with `apiKey` replaced by its masked representation
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const provider = await getCustomProviderById({ id });

  if (!provider || provider.userId !== session.user.id) {
    return new ChatbotError("not_found:database").toResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const parsed = updateProviderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = { ...parsed.data };
  if (
    updates.apiKey &&
    updates.apiKey.length > 0 &&
    !updates.apiKey.includes("...")
  ) {
    updates.apiKey = encrypt(updates.apiKey);
  } else {
    updates.apiKey = undefined;
  }

  const updated = await updateCustomProvider({ id, ...updates });
  return Response.json({
    ...updated,
    apiKey: maskApiKey(updated.name),
  });
}

/**
 * Deletes a custom provider owned by the authenticated user.
 *
 * Authenticates the caller, verifies that the provider identified by `id` exists and is owned by the session user, deletes it, and returns a success response.
 *
 * @returns A Response whose JSON body is `{ success: true }` on successful deletion. If the caller is unauthenticated or the provider does not exist or is not owned by the user, an appropriate error response is returned.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const provider = await getCustomProviderById({ id });

  if (!provider || provider.userId !== session.user.id) {
    return new ChatbotError("not_found:database").toResponse();
  }

  await deleteCustomProvider({ id });
  return Response.json({ success: true });
}
