"use client";

import { BrainIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type ThinkingModeToggleProps = {
  value: "fast" | "thinking";
  onChange: (value: "fast" | "thinking") => void;
  disabled?: boolean;
};

function PureThinkingModeToggle({
  value,
  onChange,
  disabled = false,
}: ThinkingModeToggleProps) {
  const isThinking = value === "thinking";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={`aspect-square h-8 rounded-lg p-1 transition-colors ${
              isThinking
                ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                : ""
            }`}
            data-testid="thinking-mode-toggle"
            disabled={disabled}
            onClick={(event) => {
              event.preventDefault();
              onChange(isThinking ? "fast" : "thinking");
            }}
            variant={isThinking ? "ghost" : "ghost"}
          >
            <BrainIcon size={14} style={{ width: 14, height: 14 }} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isThinking ? "Deep thinking enabled" : "Standard response"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const ThinkingModeToggle = memo(PureThinkingModeToggle);
