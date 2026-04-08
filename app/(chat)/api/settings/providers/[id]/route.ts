import { auth } from "@/app/(auth)/auth";
import {
  deleteCustomProvider,
  getCustomProviderById,
  updateCustomProvider,
} from "@/lib/db/queries";
import { decrypt, encrypt, maskApiKey } from "@/lib/encryption";
import { ChatbotError } from "@/lib/errors";
import { updateProviderSchema } from "@/lib/settings-schemas";

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
    apiKey: updated.apiKey,
    apiKeyPreview: maskApiKey(decrypt(updated.apiKey)),
  });
}

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
