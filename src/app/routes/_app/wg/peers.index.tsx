import { WgPeersPage } from "@pages/wg-peers";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/** Фильтры списка пиров — в адресе: ссылкой можно поделиться, «Назад» работает. */
const searchSchema = z.object({
  nodeId: z.string().optional().catch(undefined),
  interfaceId: z.string().optional().catch(undefined),
  userId: z.string().optional().catch(undefined),
  enabled: z.boolean().optional().catch(undefined),
  online: z.boolean().optional().catch(undefined),
  query: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/wg/peers/")({
  validateSearch: searchSchema,
  component: WgPeersPage,
});
