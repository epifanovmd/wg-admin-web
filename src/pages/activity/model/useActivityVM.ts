import { useAuditFeed } from "@entities/audit";
import { IMainApi } from "@shared/api";

export const useActivityVM = () => {
  const api = IMainApi.useInstance();

  const feed = useAuditFeed(
    (cursor, limit) => api.getMyAudit({ cursor, limit }),
    [],
  );

  return { feed };
};
