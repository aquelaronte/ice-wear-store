import { fetchClient } from "@/api/client";
import type { Message } from "@/lib/types/message";
import { useMutation } from "@tanstack/react-query";
import { useReducer, useRef, useState } from "react";
import { messagePipe } from "./lib/process-message";

export const MAX_ATTACHMENTS = 3;

async function uploadImage(file: File): Promise<string> {
  const response = await fetchClient.POST("/upload-image", {
    body: { image: file as unknown as string },
    bodySerializer: () => {
      const form = new FormData();
      form.append("image", file);
      return form;
    },
  });

  if (!response.data || response.error) {
    throw response.error ?? new Error("Image upload failed");
  }

  return response.data.url;
}

export function useChatbot() {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [messages, addMessage] = useReducer(
    (prev, n: Message) => [...prev, n],
    [] as Message[],
  );
  const threadId = useRef<string>(null);
  const mutation = useMutation({
    mutationFn: async (request: { text: string; files: File[] }) => {
      // Upload attachments first, then append their URLs to the message so the
      // LLM (which only receives `message`) can see them.
      const imageUrls = await Promise.all(request.files.map(uploadImage));

      const response = await fetchClient.POST("/chat", {
        body: {
          message: request.text,
          thread_id: threadId.current ?? undefined,
          image_urls: imageUrls,
        },
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
        content: request.text,
        role: "USER",
        createdAt: new Date(),
        images: request.files.map((file) => URL.createObjectURL(file)),
      });
      setInput("");
      setAttachments([]);
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
    if ((!value && attachments.length === 0) || mutation.isPending) return;
    mutation.mutateAsync({ text: value, files: attachments });
  }

  function addAttachments(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    setAttachments((prev) => [...prev, ...images].slice(0, MAX_ATTACHMENTS));
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  return {
    input,
    setInput,
    isBusy: mutation.isPending,
    messages,
    submit,
    attachments,
    addAttachments,
    removeAttachment,
  };
}
