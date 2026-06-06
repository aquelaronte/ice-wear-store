import { $api } from "@/api/client";
import { ImageGallery } from "@/components/image-gallery";
import { formatPrice } from "@/lib/format-price";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();

  const { data, isPending, isError } = $api.useQuery(
    "get",
    "/products/{id}",
    { params: { path: { id: slug } } },
  );

  if (isPending) {
    return <ProductLoading />;
  }

  if (isError || !data?.item) {
    return <ProductNotFound />;
  }

  const product = data.item;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Collection
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ImageGallery images={product.pictures ?? []} name={product.name} />

        <div className="lg:py-2">
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-medium tabular-nums">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-secondary" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-4/5 w-full animate-pulse rounded-xl bg-secondary" />
        <div className="flex flex-col gap-4 lg:py-2">
          <div className="h-9 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-7 w-24 animate-pulse rounded bg-secondary" />
          <div className="mt-2 flex flex-col gap-2">
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Product not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The piece you're looking for may have melted away or never existed.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to collection
      </Link>
    </main>
  );
}
