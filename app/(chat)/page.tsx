import { cookies } from "next/headers";
import { Suspense } from "react";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getCustomModelsForUser } from "@/lib/ai/custom-models";
import { getUserProfile } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

/**
 * Renders the new chat page inside a Suspense boundary with a minimal fallback.
 *
 * @returns A React element wrapping <NewChatPage /> in a Suspense boundary whose fallback is a full-height flexible div.
 */
export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage />
    </Suspense>
  );
}

/**
 * Render the new chat page initialized with the chosen chat model and streaming handler.
 *
 * Chooses the chat's initial model from the `chat-model` cookie if present; otherwise uses the user's profile `preferences.defaultModel` if available, or the first custom model for the user when present. Generates a new chat UUID and renders a `Chat` component configured for a private, editable chat along with a `DataStreamHandler`.
 *
 * @returns A React fragment containing a `Chat` component configured for a new chat session and a `DataStreamHandler`.
 */
async function NewChatPage() {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const id = generateUUID();

  let defaultModel = "";

  const session = await auth();
  if (session?.user) {
    const profile = await getUserProfile({ userId: session.user.id });
    if (profile?.preferences?.defaultModel) {
      defaultModel = profile.preferences.defaultModel;
    }

    if (!defaultModel) {
      const models = await getCustomModelsForUser(session.user.id);
      if (models.length > 0) {
        defaultModel = models[0].id;
      }
    }
  }

  const chatModel = modelIdFromCookie?.value || defaultModel;

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={chatModel}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
