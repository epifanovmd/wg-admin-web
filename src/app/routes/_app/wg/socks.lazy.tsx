import { WgSocksPage } from "@pages/wg-socks";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/socks")({
  component: WgSocksPage,
});
