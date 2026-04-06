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

/**
 * Renders a sidebar user menu showing the user's avatar, display label, and actions for Settings and authentication.
 *
 * The displayed avatar and name prefer profile settings when available and fall back to defaults derived from `user`. The menu shows a loading placeholder while authentication status is being determined. Selecting "Settings" navigates to the settings page; the authentication action either navigates to the login page for guests or signs the user out.
 *
 * @param user - The current user's basic information (used as fallback for avatar and label)
 * @returns A JSX element containing the sidebar user navigation menu
 */
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
              <SidebarMenuButton className="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex flex-row gap-2">
                  <div className="size-6 animate-pulse rounded-full bg-muted-foreground/20" />
                  <span className="animate-pulse rounded-md bg-muted-foreground/20 text-transparent">
                    Loading auth status
                  </span>
                </div>
                <div className="animate-spin text-muted-foreground">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                data-testid="user-nav-button"
              >
                <Image
                  alt={user.email ?? "User Avatar"}
                  className="rounded-full"
                  height={24}
                  src={avatarSrc}
                  width={24}
                />
                <span className="truncate" data-testid="user-email">
                  {displayLabel}
                </span>
                <ChevronUp className="ml-auto" />
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
