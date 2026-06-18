import type { Message } from "@/lib/types/message";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format-price";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { retrieveItem } from "./hooks/lib/process-message";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const itemRegex = /(\[ITEM:\s*[^\]]+\])/gi;

export function ChatbotMessage({ message }: { message: Message }) {
  const isUser = message.role === "USER";
  const content = retrieveMessageContent(message);

  return (
    <div
      key={message.createdAt?.getTime()}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-secondary text-secondary-foreground",
        )}
      >
        {message.images && message.images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt=""
                className="size-28 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

function retrieveMessageContent(message: Message): ReactNode {
  if (message.role === "USER") {
    return message.content;
  }

  // Split message content into parts separated by tags
  const parts = message.content.split(itemRegex);

  return parts.flatMap((part) => {
    if (part.match(itemRegex)) {
      const itemId = part.replace(/\[ITEM:\s*|\]/gi, "");

      return <ItemCard itemId={itemId} />;
    }

    return part;
  });
}

function ItemCard({ itemId }: { itemId: string }) {
  const item = retrieveItem(itemId);

  if (!item) {
    return (
      <div className="my-2 w-60 overflow-hidden rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <h3 className="mb-1 font-heading text-sm font-bold tracking-wide">
          Error
        </h3>
        <p className="text-xs text-muted-foreground">
          Hubo un error tratando de encontrar este item
        </p>
      </div>
    );
  }

  const pictures = item.pictures ?? [];

  return (
    <div className="group my-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {pictures.length > 0 ? (
          <Carousel className="h-full">
            <CarouselContent className="h-full">
              {pictures.map((picture, i) => (
                <CarouselItem key={picture + i} className="h-full">
                  <img
                    className="aspect-square h-full w-full object-cover"
                    src={picture}
                    alt={item.name}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2 opacity-0 transition-opacity group-hover:opacity-100" />
            <CarouselNext className="right-2 opacity-0 transition-opacity group-hover:opacity-100" />
          </Carousel>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      <div className="space-y-1.5 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm font-bold leading-snug tracking-wide line-clamp-2">
            {item.name}
          </h3>
        </div>
        <p className="text-sm font-semibold text-primary">
          {formatPrice(item.price)}
        </p>
        {item.description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <Link
          to="/product/$slug"
          params={{ slug: item.id }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
        >
          Ver detalles
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
