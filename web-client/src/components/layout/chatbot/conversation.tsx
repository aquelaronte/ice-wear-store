import { PopoverContent } from "@/components/ui/popover";
import { ImageIcon, SendIcon, SnowflakeIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { MAX_ATTACHMENTS, useChatbot } from "./hooks/use-chatbot";
import { ChatbotWelcome } from "./welcome";
import { ChatbotMessage } from "./message";
import { useTranslation } from "react-i18next";

export interface ChatbotConversationProps {
  open: boolean;
}
export function ChatbotConversation({ open }: ChatbotConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    input,
    setInput,
    messages,
    submit,
    isBusy,
    attachments,
    addAttachments,
    removeAttachment,
  } = useChatbot();

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const previews = useMemo(
    () =>
      attachments.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [attachments],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const { t } = useTranslation();

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isBusy;
  const canAttach = attachments.length < MAX_ATTACHMENTS && !isBusy;

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

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-3 pt-3">
          {previews.map((preview, i) => (
            <div
              key={preview.url}
              className="relative size-16 overflow-hidden rounded-lg border border-border"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                aria-label="Remove attachment"
                className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition-colors hover:bg-background"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addAttachments(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canAttach}
          aria-label="Attach image"
          title={`Attach image (up to ${MAX_ATTACHMENTS})`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <ImageIcon className="size-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Frost..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <SendIcon className="size-4" />
        </button>
      </form>
    </PopoverContent>
  );
}
