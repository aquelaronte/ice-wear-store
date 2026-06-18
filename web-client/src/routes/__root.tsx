import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { Chatbot } from "@/components/layout/chatbot";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <SiteHeader />
      <Outlet />
      <Chatbot />
    </React.Fragment>
  );
}
