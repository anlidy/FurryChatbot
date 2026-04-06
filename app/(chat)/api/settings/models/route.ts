import { auth } from "@/app/(auth)/auth";
import { getCustomModelsForUser } from "@/lib/ai/custom-models";
import { ChatbotError } from "@/lib/errors";

/**
 * Handle GET requests by returning the authenticated user's custom AI models.
 *
 * If the request is unauthenticated, responds with an unauthorized ChatbotError response.
 *
 * @returns A Response containing the user's custom models as JSON, or an unauthorized error response when no authenticated user is present.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const customModels = await getCustomModelsForUser(session.user.id);
  return Response.json(customModels);
}
