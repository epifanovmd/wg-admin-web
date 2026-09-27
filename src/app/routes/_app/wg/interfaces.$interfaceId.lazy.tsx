import { WgInterfaceDetailPage } from "@pages/wg-interface-detail";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/interfaces/$interfaceId")({
  component: WgInterfaceDetailPage,
});
