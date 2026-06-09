import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import { MessageCircleIcon, XIcon } from "lucide-react";

export interface ChatbotLancherProps {
  open: boolean;
}
export function ChatbotLancher({ open }: ChatbotLancherProps) {
  return (
    <PopoverTrigger asChild>
      <Button className="fixed bottom-5 right-5 flex items-center justify-center rounded-full size-14">
        {open ? (
          <XIcon className="size-6" />
        ) : (
          <MessageCircleIcon className="size-6" />
        )}
      </Button>
    </PopoverTrigger>
  );
}
