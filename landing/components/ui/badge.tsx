import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "outline" | "soft";

const variants: Record<BadgeVariant, string> = {
  default: "bg-accent text-accent-foreground",
  outline: "border border-card-border text-muted",
  soft: "bg-accent/10 text-accent border border-accent/20",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "soft", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
