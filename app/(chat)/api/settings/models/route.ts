import { auth } from "@/app/(auth)/auth";
import { getCustomModelsForUser } from "@/lib/ai/custom-models";
import { ChatbotError } from "@/lib/errors";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const customModels = await getCustomModelsForUser(session.user.id);
  return Response.json(customModels);
}
