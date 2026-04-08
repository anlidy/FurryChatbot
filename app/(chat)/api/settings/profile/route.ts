import { auth } from "@/app/(auth)/auth";
import { getUserProfile, upsertUserProfile } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { updateProfileSchema } from "@/lib/settings-schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const profile = await getUserProfile({ userId: session.user.id });
  return Response.json(
    profile ?? {
      id: session.user.id,
      displayName: null,
      avatarUrl: null,
      preferences: {},
    }
  );
}

export async function PATCH(request: Request) {
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

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { displayName, preferences } = parsed.data;
  const existing = await getUserProfile({ userId: session.user.id });

  const mergedPreferences = preferences
    ? { ...(existing?.preferences ?? {}), ...preferences }
    : undefined;

  const result = await upsertUserProfile({
    userId: session.user.id,
    displayName,
    preferences: mergedPreferences,
  });

  return Response.json(result[0] ?? result);
}
