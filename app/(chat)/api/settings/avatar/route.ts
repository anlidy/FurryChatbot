import { put } from "@vercel/blob";
import { auth } from "@/app/(auth)/auth";
import { upsertUserProfile } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
