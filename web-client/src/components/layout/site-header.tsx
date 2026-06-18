"use client";

import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <nav className="hidden flex-1 items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">
            Collection
          </Link>
          <Link to="/" className="transition-colors hover:text-foreground">
            Outerwear
          </Link>
          <Link to="/" className="transition-colors hover:text-foreground">
            Accessories
          </Link>
        </nav>

        <Link
          to="/"
          className="flex items-center gap-2 md:flex-1 md:justify-center"
        >
          <span className="font-heading text-lg font-bold tracking-tight">
            ICE<span className="text-primary">WEAR</span>
          </span>
        </Link>

        <div className="hidden flex-1 md:block" aria-hidden="true" />
      </div>
    </header>
  );
}
