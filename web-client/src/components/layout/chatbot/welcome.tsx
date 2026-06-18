const SUGGESTIONS = [
  "Quiero un outfit de estilo aesthetic",
  "Muéstrame una camiseta que combine con un pantalón negro",
  "Recomiéndame zapatos negros para hombre",
];

export interface ChatbotWelcomeProps {
  submit: (value: string) => void;
}
export function ChatbotWelcome({ submit }: ChatbotWelcomeProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        Hola, soy Frost. Pregúntame lo que sea acerca de nuestro catálogo. Puedo
        ayudarte escogiendo tallas, prendas y outfits
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
