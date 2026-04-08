"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "General", href: "/settings/general" },
  { label: "Providers", href: "/settings/providers" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5">
        <h1 className="font-semibold text-xl">Settings</h1>
        <button
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => router.push("/")}
          type="button"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 px-4 pt-1">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                href={tab.href}
                key={tab.href}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto px-8 py-2">{children}</main>
      </div>
    </div>
  );
}
