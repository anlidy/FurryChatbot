"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { type ChangeEvent, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { ChatModel } from "@/lib/ai/models";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ProfileData = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  preferences: {
    theme?: "light" | "dark" | "system";
    defaultModel?: string;
  } | null;
};

/**
 * Renders the General Settings page for viewing and editing the user's profile and preferences.
 *
 * Displays the user's avatar and display name, lets the user upload a new avatar, update their display name, and change preferences (theme and default model). Data is loaded from settings endpoints and updates are persisted via API calls with optimistic UI refreshes.
 *
 * @returns The settings page React element containing profile controls (avatar, display name, save) and preference selectors (theme and default model).
 */
export default function GeneralSettingsPage() {
  const { data: profile, mutate } = useSWR<ProfileData>(
    "/api/settings/profile",
    fetcher
  );
  const { data: models } = useSWR<ChatModel[]>("/api/settings/models", fetcher);
  const { setTheme, theme: currentTheme } = useTheme();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveDisplayName = displayName ?? profile?.displayName ?? "";
  const effectiveTheme =
    profile?.preferences?.theme ??
    (currentTheme as "light" | "dark" | "system") ??
    "system";
  const effectiveDefaultModel =
    profile?.preferences?.defaultModel ?? models?.[0]?.id ?? "";

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: effectiveDisplayName }),
      });
      await mutate();
      toast({ type: "success", description: "Profile saved" });
    } catch {
      toast({ type: "error", description: "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ type: "error", description: data.error ?? "Upload failed" });
        return;
      }
      await mutate();
      toast({ type: "success", description: "Avatar updated" });
    } catch {
      toast({ type: "error", description: "Upload failed" });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handlePreferenceChange(
    key: "theme" | "defaultModel",
    value: string
  ) {
    if (key === "theme") {
      setTheme(value);
    }
    try {
      await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: { [key]: value },
        }),
      });
      await mutate();
    } catch {
      toast({ type: "error", description: "Failed to save preference" });
    }
  }

  const avatarSrc =
    profile?.avatarUrl ??
    `https://avatar.vercel.sh/${profile?.id ?? "default"}`;

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h2 className="font-semibold text-lg">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      <section className="space-y-5">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Profile
        </h3>

        <div className="flex items-center gap-6">
          <button
            className="group relative shrink-0"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Image
              alt="Avatar"
              className="rounded-full object-cover"
              height={64}
              src={avatarSrc}
              width={64}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-white">
                {uploadingAvatar ? "..." : "Edit"}
              </span>
            </div>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
              ref={fileInputRef}
              type="file"
            />
          </button>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="displayName">
              Display Name
            </label>
            <input
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-ring dark:focus:border-ring"
              id="displayName"
              maxLength={100}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              value={effectiveDisplayName}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={saving} onClick={handleSaveProfile} size="sm">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Preferences
        </h3>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <select
              className="rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none"
              onChange={(e) => handlePreferenceChange("theme", e.target.value)}
              value={effectiveTheme}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Default Model</p>
              <p className="text-xs text-muted-foreground">
                Used for new conversations
              </p>
            </div>
            <select
              className="rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm outline-none"
              onChange={(e) =>
                handlePreferenceChange("defaultModel", e.target.value)
              }
              value={effectiveDefaultModel}
            >
              {(models ?? []).map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
