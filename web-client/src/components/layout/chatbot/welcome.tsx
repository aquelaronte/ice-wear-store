const SUGGESTIONS = [
  "What's the warmest jacket?",
  "Help me pick a size",
  "What goes with the parka?",
];

export interface ChatbotWelcomeProps {
  submit: (value: string) => void;
}
export function ChatbotWelcome({ submit }: ChatbotWelcomeProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        Hi, I&apos;m Frost. Ask me anything about staying warm — I can help you
        pick layers, sizes and pairings.
      </div>
      <div className="flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
