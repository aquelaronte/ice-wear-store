import { useTranslation } from "react-i18next";

export interface ChatbotWelcomeProps {
  submit: (value: string) => void;
}
export function ChatbotWelcome({ submit }: ChatbotWelcomeProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        {t("frost.welcome")}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => {
          const message = t(`frost.suggestions.${i}`);

          return (
            <button
              key={i}
              onClick={() => submit(message)}
              className="rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {message}
            </button>
          );
        })}
      </div>
    </div>
  );
}
