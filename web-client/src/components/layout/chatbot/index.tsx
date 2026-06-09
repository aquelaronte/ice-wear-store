"use client";

import { useState } from "react";
import { ChatbotLancher } from "./launcher";
import { Popover } from "@/components/ui/popover";
import { ChatbotConversation } from "./conversation";

export function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ChatbotLancher open={open} />
      <ChatbotConversation open={open} />
    </Popover>
  );
}
