import { fetchClient } from "@/api/client";
import type { components } from "@/api/schema.gen";
import type { Message } from "@/lib/types/message";

const itemsDictionary = new Map<string, components["schemas"]["Item"]>();
const itemTagRegex =
  /\[ITEM:\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\]/gi;

export async function messagePipe(message: Message): Promise<Message> {
  if (message.role === "USER") {
    return message;
  }

  // Extract UUIDS from tags into message content like [ITEM: <uuid>]
  const matches = [...message.content.matchAll(itemTagRegex)];
  const uuids = matches.map((m) => m[1]);

  // Fetch all items
  const missingItems = uuids.filter((u) => !itemsDictionary.has(u));

  if (missingItems.length === 0) {
    return message;
  }

  const response = await fetchClient.GET("/products/id-list", {
    params: {
      query: {
        ids: missingItems,
      },
    },
  });

  for (const item of response.data?.items ?? []) {
    itemsDictionary.set(item.id, item);
  }

  return message;
}

export function retrieveItem(id: string): components["schemas"]["Item"] | null {
  return itemsDictionary.get(id) || null;
}
