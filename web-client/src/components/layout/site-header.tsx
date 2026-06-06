"use client"

import { Link } from "@tanstack/react-router"
import { ShoppingBag } from "lucide-react"
import { useCart } from "../providers/cart-provider"

export function SiteHeader() {
  const { totalItems, openCart } = useCart()

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

        <Link to="/" className="flex items-center gap-2 md:flex-1 md:justify-center">
          <span className="font-heading text-lg font-bold tracking-tight">
            ICE<span className="text-primary">WEAR</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="size-5" />
            <span className="hidden sm:inline">Bag</span>
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground tabular-nums">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
