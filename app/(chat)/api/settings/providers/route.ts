import { auth } from "@/app/(auth)/auth";
import {
  createCustomProvider,
  getCustomModels,
  getCustomProviders,
} from "@/lib/db/queries";
import { encrypt, maskApiKey } from "@/lib/encryption";
import { ChatbotError } from "@/lib/errors";
import { createProviderSchema } from "@/lib/settings-schemas";

/**
 * Retrieve the authenticated user's custom providers along with each provider's masked API key, model count, and models.
 *
 * @returns A Response whose JSON body is an array of provider objects augmented with `apiKey` (masked string), `modelCount` (number), and `models` (array). If the caller is unauthenticated, returns the corresponding error response.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const providers = await getCustomProviders({ userId: session.user.id });

  const result = await Promise.all(
    providers.map(async (p) => {
      const models = await getCustomModels({ providerId: p.id });
      return {
        ...p,
        apiKey: maskApiKey(p.name),
        modelCount: models.length,
        models,
      };
    })
  );

  return Response.json(result);
}

/**
 * Creates a new custom provider for the authenticated user from the JSON request body.
 *
 * Validates the request payload, encrypts the provided API key, persists the provider for the current user,
 * and returns the created provider with the API key masked.
 *
 * @param request - HTTP request whose JSON body must include `name`, `baseUrl`, `apiKey`, and `format`
 * @returns A JSON Response with the created provider (with `apiKey` masked) and HTTP status `201`. On failure, returns an unauthorized error response, a bad request error response for invalid JSON, or a `400` JSON response containing validation errors.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const parsed = createProviderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, baseUrl, apiKey, format } = parsed.data;
  const encryptedKey = encrypt(apiKey);

  const provider = await createCustomProvider({
    userId: session.user.id,
    name,
    baseUrl,
    apiKey: encryptedKey,
    format,
  });

  return Response.json(
    { ...provider, apiKey: maskApiKey(apiKey) },
    { status: 201 }
  );
}
