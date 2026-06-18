"use client";

import { useNavigate } from "@tanstack/react-router";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n/init";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "EN",
  es: "ES",
};

export interface LanguageSwitcherProps {
  lang: SupportedLanguage;
}

export function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const navigate = useNavigate();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-0.5 rounded-full border border-border/60 p-0.5"
    >
      {SUPPORTED_LANGUAGES.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() =>
              navigate({ to: ".", search: (prev) => ({ ...prev, lang: code }) })
            }
            className={
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {LANGUAGE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
