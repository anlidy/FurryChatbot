import { cookies } from "next/headers";
import { Suspense } from "react";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getCustomModelsForUser } from "@/lib/ai/custom-models";
import { getUserProfile } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { auth } from "../(auth)/auth";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <NewChatPage />
    </Suspense>
  );
}

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
        isReadonly={false}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
