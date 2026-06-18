import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { $api } from "@/api/client";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react";

const PAGE_SIZE = 8;

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [_search, setSearch] = useState("");
  const [search] = useDebounce(_search, 300);
  const { data, isLoading } = $api.useQuery("get", "/products", {
    params: {
      query: {
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        search,
      },
    },
  });

  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const { t } = useTranslation();

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen">
      <section
        id="outerwear"
        className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-14 sm:px-8 sm:pb-20 pt-4"
      >
        <div className="mb-8 flex justify-between gap-4 items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={_search}
              placeholder={t("search.placeholder")}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-11 w-full rounded-full border border-border bg-background pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {_search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground text-nowrap">
            {isLoading ? t("loading...") : `${data?.count ?? 0} ${t("pieces")}`}
          </span>
        </div>
        {!isLoading && total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search
                ? t("search.noResults", { query: search })
                : t("search.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : data?.items?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}

        {!isLoading && total > PAGE_SIZE && (
          <div className="mt-12 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("previous")}
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {t("pageOf", { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="lg"
              disabled={!hasNext}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("next")}
            </Button>
          </div>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            ICE<span className="text-primary">WEAR</span>
          </span>
          <p>© 2026 Ice Wear Store. Stay warm.</p>
        </div>
      </footer>
    </main>
  );
}
