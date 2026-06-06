import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/format-price";
import { createFileRoute } from "@tanstack/react-router";
import heroIceUrl from "@/assets/hero-ice.png";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const outerwear = products.filter((p) => p.category === "Outerwear");

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-110 w-full overflow-hidden">
          <img
            src={heroIceUrl}
            alt="Model wearing Ice Wear cold-weather apparel in a frosty landscape"
            sizes="100vw"
            className="object-cover absolute top-0 left-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/50 via-foreground/10 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-background/80">
                Winter 2026 Collection
              </p>
              <h1 className="mt-3 max-w-2xl text-balance font-heading text-4xl font-bold leading-[1.05] tracking-tight text-background sm:text-6xl">
                Built for the coldest days.
              </h1>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-background/85">
                Engineered layers, considered warmth, and a palette pulled
                straight from the ice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outerwear */}
      <section
        id="outerwear"
        className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              All
            </h2>
            <p className="mt-1 text-muted-foreground">Shirts, shoes, pants</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {outerwear.length} pieces
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
          {outerwear.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
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
