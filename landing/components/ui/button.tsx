import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "outline" | "ghost";
export type ButtonSize = "default" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-accent text-accent-foreground hover:bg-accent-strong shadow-[0_0_0_1px_rgba(45,212,191,0.15)]",
  outline:
    "border border-card-border bg-transparent text-foreground hover:border-accent/50 hover:bg-white/5",
  ghost: "bg-transparent text-foreground hover:bg-white/5",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  sm: "h-9 px-4 text-sm",
};

export function buttonVariants(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const { variant = "default", size = "default", className } = opts ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
