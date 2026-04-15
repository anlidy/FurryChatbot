"use client";

import { ChevronUp, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { toast } from "./toast";

const profileFetcher = (url: string) => fetch(url).then((r) => r.json());

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { data: profile } = useSWR("/api/settings/profile", profileFetcher);

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  const avatarSrc =
    profile?.avatarUrl ?? `https://avatar.vercel.sh/${user.email}`;
  const displayLabel =
    profile?.displayName || (isGuest ? "Guest" : user?.email);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === "loading" ? (
              <SidebarMenuButton className="h-12 w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                <div className="flex flex-row gap-2 group-data-[collapsible=icon]:hidden">
                  <div className="size-8 animate-pulse rounded-full bg-muted-foreground/20" />
                  <span className="animate-pulse rounded-md bg-muted-foreground/20 text-transparent">
                    Loading auth status
                  </span>
                </div>
                <div className="animate-spin text-muted-foreground group-data-[collapsible=icon]:hidden">
                  <LoaderIcon />
                </div>
                <div className="hidden size-8 animate-pulse rounded-full bg-muted-foreground/20 group-data-[collapsible=icon]:block" />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-12 w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                data-testid="user-nav-button"
              >
                <Image
                  alt={user.email ?? "User Avatar"}
                  className="size-8 shrink-0 rounded-full"
                  height={32}
                  src={avatarSrc}
                  width={32}
                />
                <span
                  className="truncate group-data-[collapsible=icon]:hidden"
                  data-testid="user-email"
                >
                  {displayLabel}
                </span>
                <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="user-nav-item-settings"
              onSelect={() => router.push("/settings")}
            >
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer"
                onClick={() => {
                  if (status === "loading") {
                    toast({
                      type: "error",
                      description:
                        "Checking authentication status, please try again!",
                    });

                    return;
                  }

                  if (isGuest) {
                    router.push("/login");
                  } else {
                    signOut({
                      redirectTo: "/",
                    });
                  }
                }}
                type="button"
              >
                {isGuest ? "Login to your account" : "Sign out"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
