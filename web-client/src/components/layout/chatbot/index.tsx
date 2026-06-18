"use client";

import { useState } from "react";
import { Popover } from "@/components/ui/popover";
import { ChatbotConversation } from "./conversation";
import { ChatbotLauncher } from "./launcher";

export function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ChatbotLauncher open={open} />
      <ChatbotConversation open={open} />
    </Popover>
  );
}
