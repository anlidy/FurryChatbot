import { auth } from "@/app/(auth)/auth";
import {
  createCustomProvider,
  getCustomModels,
  getCustomProviders,
} from "@/lib/db/queries";
import { decrypt, encrypt, maskApiKey } from "@/lib/encryption";
import { ChatbotError } from "@/lib/errors";
import { createProviderSchema } from "@/lib/settings-schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const providers = await getCustomProviders({ userId: session.user.id });

  const result = await Promise.all(
    providers.map(async (p) => {
      const models = await getCustomModels({ providerId: p.id });
      const plainKey = decrypt(p.apiKey);
      return {
        ...p,
        apiKey: p.apiKey,
        apiKeyPreview: maskApiKey(plainKey),
        modelCount: models.length,
        models,
      };
    })
  );

  return Response.json(result);
}

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
    {
      ...provider,
      apiKey: provider.apiKey,
      apiKeyPreview: maskApiKey(apiKey),
    },
    { status: 201 }
  );
}
