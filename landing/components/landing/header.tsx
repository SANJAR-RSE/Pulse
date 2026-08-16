"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PulseIcon, MenuIcon, XIcon } from "@/components/icons";
import { WEB_URL } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "#solution", label: "Yechim" },
  { href: "#daily-health", label: "Imkoniyatlar" },
  { href: "#queue", label: "Raqamli navbat" },
  { href: "#ai", label: "PULSE AI" },
  { href: "#how-it-works", label: "Qanday ishlaydi" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
            <PulseIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-base text-foreground">PULSE</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a href={WEB_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm">Boshlash</Button>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border text-foreground transition-colors duration-200 hover:border-accent/40 md:hidden"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
        >
          {open ? <XIcon className="h-4.5 w-4.5" /> : <MenuIcon className="h-4.5 w-4.5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-card-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href={WEB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <Button size="sm" className="w-full">
                Boshlash
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
