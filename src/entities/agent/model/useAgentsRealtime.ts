import type { AgentDto } from "@shared/api/gen/main/model";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

import { IAgentsStore } from "./types";

/**
 * Комната `agents`: изменения агентов (с их проблемами и новыми версиями)
 * попадают в стор. После переподключения события за время обрыва потеряны —
 * список перечитывается.
 */
export const useAgentsRealtime = (enabled: boolean): void => {
  const store = IAgentsStore.useInstance();

  useSocketRoom("agents", enabled ? "all" : null, () => {
    void store.load();
  });
  useSocketEvent<[AgentDto]>("agent:updated", store.upsert, enabled);
  useSocketEvent<[{ id: string }]>(
    "agent:deleted",
    ({ id }) => store.remove(id),
    enabled,
  );
};
