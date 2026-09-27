import { WgPeerDetailPage } from "@pages/wg-peer-detail";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/peers/$peerId")({
  component: WgPeerDetailPage,
});
