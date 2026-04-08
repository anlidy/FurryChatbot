"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirects the user to the general settings route when the component mounts.
 *
 * Performs a client-side navigation to "/settings/general" on mount and renders no UI.
 *
 * @returns `null` — the component does not render any visible output
 */
export default function SettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings/general");
  }, [router]);
  return null;
}
