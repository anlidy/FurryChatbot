import Link from "next/link";
import { memo, useState } from "react";
import type { Chat } from "@/lib/db/schema";
import { MoreHorizontalIcon, PencilEditIcon, TrashIcon } from "./icons";
import { toast } from "./toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === chat.title) {
      setShowRenameDialog(false);
      return;
    }

    setIsRenaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chat.id,
          title: newTitle.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename chat");
      }

      toast({
        type: "success",
        description: "Chat renamed successfully",
      });

      // Refresh the page to update the chat list
      window.location.reload();
    } catch (_error) {
      toast({
        type: "error",
        description: "Failed to rename chat",
      });
    } finally {
      setIsRenaming(false);
      setShowRenameDialog(false);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
            <span>{chat.title}</span>
          </Link>
        </SidebarMenuButton>

        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="mr-0.5 cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              showOnHover={!isActive}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                setNewTitle(chat.title);
                setShowRenameDialog(true);
              }}
            >
              <PencilEditIcon />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <Dialog onOpenChange={setShowRenameDialog} open={showRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title for this chat conversation.
            </DialogDescription>
          </DialogHeader>
          <Input
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
            placeholder="Chat title"
            value={newTitle}
          />
          <DialogFooter>
            <Button
              disabled={isRenaming}
              onClick={() => setShowRenameDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isRenaming} onClick={handleRename}>
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});
