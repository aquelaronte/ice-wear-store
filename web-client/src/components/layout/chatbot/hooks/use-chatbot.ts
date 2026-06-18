import { fetchClient } from "@/api/client";
import type { components } from "@/api/schema.gen";
import type { Message } from "@/lib/types/message";
import { useMutation } from "@tanstack/react-query";
import { useReducer, useRef, useState } from "react";
import { messagePipe } from "./lib/process-message";

export function useChatbot() {
  const [input, setInput] = useState("");
  const [messages, addMessage] = useReducer(
    (prev, n: Message) => [...prev, n],
    [] as Message[],
  );
  const threadId = useRef<string>(null);
  const mutation = useMutation({
    mutationFn: async (body: components["schemas"]["ChatInputBody"]) => {
      const response = await fetchClient.POST("/chat", {
        body,
      });

      if (!response.data || response.error) {
        throw response.error ?? new Error("Service unavailable");
      }

      await messagePipe({
        content: response.data.answer,
        role: "AI",
        createdAt: new Date(),
      });

      return response.data;
    },
    onMutate: (request) => {
      addMessage({
        content: request.message,
        role: "USER",
        createdAt: new Date(),
      });
      setInput("");
    },
    onSuccess: (response) => {
      addMessage({
        content: response.answer,
        role: "AI",
        createdAt: new Date(),
      });

      if (response.new_thread_id) {
        threadId.current = response.new_thread_id;
      }
    },
  });

  function submit(text: string) {
    const value = text.trim();
    if (!value || mutation.isPending) return;
    mutation.mutateAsync({
      message: value,
      thread_id: threadId.current ?? undefined,
    });
  }

  return {
    input,
    setInput,
    isBusy: mutation.isPending,
    messages,
    submit,
  };
}
