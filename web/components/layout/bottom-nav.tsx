"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor } from "@/lib/nav";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const items = navFor(role).filter((item) => item.inBottomNav);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "scale-110")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
