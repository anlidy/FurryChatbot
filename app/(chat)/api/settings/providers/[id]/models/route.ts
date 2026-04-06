import { auth } from "@/app/(auth)/auth";
import {
  createCustomModel,
  deleteCustomModel,
  getCustomModels,
  getCustomProviderById,
  toggleCustomModel,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { createModelSchema, toggleModelSchema } from "@/lib/settings-schemas";

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

  await deleteCustomModel({ id: modelId });
  return Response.json({ success: true });
}

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

  const model = await toggleCustomModel({ id: modelId, ...parsed.data });
  return Response.json(model);
}
