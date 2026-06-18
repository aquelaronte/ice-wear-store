import { PopoverContent } from "@/components/ui/popover";
import { SendIcon, SnowflakeIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChatbot } from "./hooks/use-chatbot";
import { ChatbotWelcome } from "./welcome";
import { ChatbotMessage } from "./message";
import { useTranslation } from "react-i18next";

export interface ChatbotConversationProps {
  open: boolean;
}
export function ChatbotConversation({ open }: ChatbotConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { input, setInput, messages, submit, isBusy } = useChatbot();

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const { t } = useTranslation();

  return (
    <PopoverContent align="end" className="p-0 overflow-hidden w-100">
      <header className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
          <SnowflakeIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Frost</p>
          <p className="text-xs text-primary-foreground/80">
            {t("frost.description")}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 max-h-100"
      >
        {messages.length === 0 && <ChatbotWelcome submit={submit} />}

        {messages.map((message, i) => {
          return (
            <ChatbotMessage
              key={message.createdAt?.toISOString() ?? i}
              message={message}
            />
          );
        })}

        {isBusy && messages.at(-1)?.role === "USER" && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Frost..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isBusy}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <SendIcon className="size-4" />
        </button>
      </form>
    </PopoverContent>
  );
}
