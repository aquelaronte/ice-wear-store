import { ImageGallery } from "@/components/image-gallery";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { formatPrice, getProduct, products } from "@/lib/format-price";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);
  if (!product) {
    notFound();
    return;
  }

  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);
  const fill = products.filter(
    (p) => p.slug !== product.slug && p.category !== product.category,
  );
  const suggestions = [...related, ...fill].slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Collection
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ImageGallery images={product.images} name={product.name} />

        <div className="lg:py-2">
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
            {product.category}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-medium tabular-nums">
            {formatPrice(product.price)}
          </p>

          <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="my-8 h-px bg-border" />

          <ProductPurchase product={product} />

          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
              Details
            </h2>
            <ul className="flex flex-col gap-2">
              {product.details.map((detail) => (
                <li
                  key={detail}
                  className="flex gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-heading text-2xl font-bold tracking-tight">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {suggestions.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
