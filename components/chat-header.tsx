"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ShareIcon } from "./icons";

function PureChatHeader({ isReadonly }: { isReadonly: boolean }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 bg-background/80 px-2 py-1.5 backdrop-blur-sm md:px-3">
      <div className="flex-1" />

      {!isReadonly && (
        <Button className="h-8 px-2 md:h-fit md:px-2" variant="outline">
          <ShareIcon />
          <span>Shared</span>
        </Button>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.isReadonly === nextProps.isReadonly;
});
