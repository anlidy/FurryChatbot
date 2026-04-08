import { auth } from "@/app/(auth)/auth";
import {
  createCustomModel,
  deleteCustomModelByIdAndProvider,
  getCustomModels,
  getCustomProviderById,
  updateCustomModelByIdAndProvider,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { createModelSchema, toggleModelSchema } from "@/lib/settings-schemas";

/**
 * Fetches the custom models belonging to the authenticated user's provider identified by `params.id`.
 *
 * Returns an unauthorized response if there is no authenticated user, or a not_found response if the provider does not exist or is not owned by the authenticated user.
 *
 * @param params - A promise resolving to route parameters; must contain `id`, the provider identifier
 * @returns A Response containing the provider's custom models as JSON
 */
export async function GET(
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

  const models = await getCustomModels({ providerId: id });
  return Response.json(models);
}

/**
 * Creates a new custom model for the provider specified by `params.id`, scoped to the authenticated user.
 *
 * Attempts to parse and validate the request JSON; on success, the model is created and returned.
 *
 * @param params - A promise resolving to route parameters; must include `id` of the provider
 * @returns The created model object as JSON with HTTP status 201
 */
export async function POST(
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

  const parsed = createModelSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const model = await createCustomModel({
    providerId: id,
    ...parsed.data,
  });

  return Response.json(model, { status: 201 });
}

/**
 * Deletes a custom model that belongs to the authenticated user's provider.
 *
 * @param request - The incoming HTTP request; `modelId` is read from its query string.
 * @param params - A promise resolving to route parameters; `id` is the provider identifier.
 * @returns A Response with `{ success: true }` when deletion succeeds, or a JSON error response with an appropriate HTTP status for unauthorized access, provider not found/unauthorized, or a missing `modelId` parameter.
 */
export async function DELETE(
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

  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("modelId");

  if (!modelId) {
    return Response.json({ error: "modelId required" }, { status: 400 });
  }

  const deleted = await deleteCustomModelByIdAndProvider({
    id: modelId,
    providerId: id,
  });
  if (!deleted) {
    return new ChatbotError("not_found:database").toResponse();
  }
  return Response.json({ success: true });
}

/**
 * Toggle properties of a custom model for the specified provider and return the updated model.
 *
 * Validates the authenticated session and that the resolved provider belongs to the session user, requires a `modelId` query parameter, and expects a JSON body that matches `toggleModelSchema`. On success returns the updated model as JSON.
 *
 * @returns The updated model as JSON in the response body. Error responses are returned as JSON with appropriate HTTP status codes (400 for missing/invalid input, 401 for unauthorized, 404 for provider not found).
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

  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("modelId");

  if (!modelId) {
    return Response.json({ error: "modelId required" }, { status: 400 });
  }

  const parsed = toggleModelSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const model = await updateCustomModelByIdAndProvider({
    id: modelId,
    providerId: id,
    ...parsed.data,
  });
  if (!model) {
    return new ChatbotError("not_found:database").toResponse();
  }
  return Response.json(model);
}
