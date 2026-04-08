import { put } from "@vercel/blob";
import { auth } from "@/app/(auth)/auth";
import { upsertUserProfile } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Handles authenticated avatar uploads: validates and stores an image, then updates the user's profile.
 *
 * Performs authentication and returns an unauthorized ChatbotError response when there is no authenticated user. Validates that a `file` field is present, that its MIME type is one of `image/jpeg`, `image/png`, or `image/webp`, and that its size is under 2MB; validation failures return a 400 JSON error. On success, uploads the file to `avatars/{userId}`, updates the user's `avatarUrl`, and returns the uploaded URL.
 *
 * @returns A JSON Response with `{ url: string }` on success; a 400 JSON error object for validation failures; or a ChatbotError response when unauthenticated.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only JPEG, PNG, and WebP images are accepted" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: "File size must be under 2MB" },
      { status: 400 }
    );
  }

  const blob = await put(`avatars/${session.user.id}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  await upsertUserProfile({
    userId: session.user.id,
    avatarUrl: blob.url,
  });

  return Response.json({ url: blob.url });
}
