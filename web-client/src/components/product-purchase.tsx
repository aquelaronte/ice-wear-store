"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "./providers/cart-provider";
import { formatPrice, type Product } from "@/lib/format-price";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.name, v.options[0]])),
  );
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      variants: selected,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-6">
        {product.variants.map((group) => (
          <div key={group.name}>
            <p className="mb-2 text-sm font-medium">
              {group.name}:{" "}
              <span className="text-muted-foreground">
                {selected[group.name]}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isActive = selected[group.name] === option;
                return (
                  <button
                    key={option}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [group.name]: option }))
                    }
                    aria-pressed={isActive}
                    className={`min-w-11 rounded-full border px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {added ? (
          <>
            <Check className="size-4" /> Added to bag
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" /> Add to bag —{" "}
            {formatPrice(product.price)}
          </>
        )}
      </button>
    </div>
  );
}
