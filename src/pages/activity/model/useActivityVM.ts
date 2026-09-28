import { useAuditFeed } from "@entities/audit";
import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { AuditEventDto } from "@shared/api/gen/main/model";
import { useSocketEvent } from "@shared/lib/socket";

export const useActivityVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();

  const feed = useAuditFeed(
    (cursor, limit) => api.getMyAudit({ cursor, limit }),
    [],
  );

  // Свои новые события приходят адресно (и из общего журнала — у админа).
  useSocketEvent<[AuditEventDto]>("audit:created", event => {
    if (event.actorId === userStore.user?.id) feed.prepend(event);
  });

  return { feed };
};
