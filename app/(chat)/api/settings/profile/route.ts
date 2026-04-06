import { auth } from "@/app/(auth)/auth";
import { getUserProfile, upsertUserProfile } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { updateProfileSchema } from "@/lib/settings-schemas";

/**
 * Handle GET requests for the authenticated user's profile.
 *
 * If the request is unauthenticated, returns an unauthorized ChatbotError response.
 *
 * @returns A Response containing the user's profile object: the stored profile when available; otherwise an object with `id` (user id), `displayName: null`, `avatarUrl: null`, and `preferences: {}`. In the unauthenticated case, returns the `unauthorized:chat` error response.
 */
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

/**
 * Handles PATCH requests to update the authenticated user's profile.
 *
 * Attempts to parse and validate the request JSON, merges provided preferences into any existing preferences, persists the updated profile, and returns the resulting profile.
 *
 * @param request - The incoming HTTP request containing a JSON body with optional `displayName` and `preferences`.
 * @returns A JSON Response containing the updated user profile object (or the first element if the persistence result is an array). On failure returns an error Response for unauthorized access, malformed JSON, or validation errors (validation errors are returned as `{ error: <flattened> }` with HTTP 400).
 */
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
