import type { components } from "@/api/schema.gen";
import { formatPrice } from "@/lib/format-price";
import { Link } from "@tanstack/react-router";

export function ProductCard({
  product,
}: {
  product: components["schemas"]["Item"];
}) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.id }}
      className="group flex flex-col"
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-secondary">
        <img
          src={product.pictures?.[0] || "/placeholder.svg"}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.pictures?.[1] && (
          <img
            src={product.pictures?.[1] || "/placeholder.svg"}
            alt=""
            aria-hidden="true"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium leading-tight">{product.name}</h3>
          {/* <p className="text-sm text-muted-foreground">{product.category}</p> */}
        </div>
        <span className="font-medium tabular-nums">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}
