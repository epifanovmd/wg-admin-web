import { WgEndpointsPage } from "@pages/wg-endpoints";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/endpoints")({
  component: WgEndpointsPage,
});
