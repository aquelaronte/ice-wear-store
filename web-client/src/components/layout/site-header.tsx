"use client";

import { Link, useSearch } from "@tanstack/react-router";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const { lang } = useSearch({ from: "__root__" });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex-1" aria-hidden="true" />

        <Link
          to="/"
          search={{ lang }}
          className="flex items-center gap-2 md:flex-1 md:justify-center"
        >
          <span className="font-heading text-lg font-bold tracking-tight">
            ICE<span className="text-primary">WEAR</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end">
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
    </header>
  );
}
