"use client";

import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
