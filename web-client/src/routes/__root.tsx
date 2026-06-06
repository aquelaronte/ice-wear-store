import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { CartProvider } from "@/components/providers/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Chatbot } from "@/components/layout/chatbot";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <CartProvider>
        <SiteHeader />
        <Outlet />
        <CartDrawer />
        <Chatbot />
      </CartProvider>
    </React.Fragment>
  );
}
