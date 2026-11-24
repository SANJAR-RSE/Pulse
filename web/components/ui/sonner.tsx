"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// PULSE is a light-only UI. The toaster must not follow the OS theme (there
// is no ThemeProvider, so "system" made every toast dark on dark-mode PCs).
// Toasts are styled like the app's cards: white, hairline border, soft
// shadow, coloured icon per type, brand-blue action button.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-600" />,
        info: <InfoIcon className="size-5 text-primary" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-red-600" />,
        loading: <Loader2Icon className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(var(--radius) * 1.4)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !items-start !gap-3 !border !border-border !bg-card !p-4 !text-card-foreground !shadow-lg !shadow-slate-900/10",
          title: "!text-sm !font-semibold !text-foreground",
          description: "!text-sm !leading-relaxed !text-muted-foreground",
          actionButton: "!rounded-lg !bg-primary !px-3 !py-1.5 !text-xs !font-semibold !text-primary-foreground",
          cancelButton: "!rounded-lg !bg-muted !text-muted-foreground",
          closeButton: "!border-border !bg-card !text-muted-foreground",
          // Coloured left accent per type — readable on the white card.
          success: "!border-l-4 !border-l-emerald-500",
          error: "!border-l-4 !border-l-red-500",
          warning: "!border-l-4 !border-l-amber-400",
          info: "!border-l-4 !border-l-primary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
