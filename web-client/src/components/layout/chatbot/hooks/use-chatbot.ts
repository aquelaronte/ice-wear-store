import { $api } from "@/api/client";
import type { Message } from "@/lib/types/message";
import { useReducer, useRef, useState } from "react";

export function useChatbot() {
  const [input, setInput] = useState("");
  const [messages, addMessage] = useReducer(
    (prev, n: Message) => [...prev, n],
    [] as Message[],
  );
  const threadId = useRef<string>(null);
  const mutation = $api.useMutation("post", "/chat", {
    onMutate: (request) => {
      addMessage({
        content: request.body.message,
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
      body: {
        message: value,
        thread_id: threadId.current ?? undefined,
      },
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
