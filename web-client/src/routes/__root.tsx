import {
  Outlet,
  createRootRouteWithContext,
  useSearch,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { Chatbot } from "@/components/layout/chatbot";
import z from "zod";
import { useEffect } from "react";
import i18n from "i18next";

const rootSearchSchema = z.object({
  lang: z.enum(["es", "en"]).default("en"),
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  validateSearch: (search) => rootSearchSchema.parse(search),
});

function RootComponent() {
  const { lang } = useSearch({ from: "__root__" });

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <>
      <SiteHeader />
      <Outlet />
      <Chatbot />
    </>
  );
}
