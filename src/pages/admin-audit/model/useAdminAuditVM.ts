import {
  AUDIT_EVENT_TYPES,
  auditEventMeta,
  useAuditFeed,
} from "@entities/audit";
import { IMainApi } from "@shared/api";
import type { IUserOptionDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useCallback, useMemo, useState } from "react";

export const AUDIT_TYPE_OPTIONS = AUDIT_EVENT_TYPES.map(type => ({
  value: type,
  label: auditEventMeta(type).label,
}));

export const useAdminAuditVM = () => {
  const api = IMainApi.useInstance();
  const [type, setType] = useState<string | null>(null);
  const [actorId, setActorId] = useState<string | null>(null);

  const users = useCollection<IUserOptionDto>({
    queryFn: async () => {
      const { data, error } = await api.getUserOptions();

      return { data: data?.data ?? null, error };
    },
    keyExtractor: u => u.id,
    autoLoad: true,
  });

  const names = useMemo(
    () => new Map(users.items.map(u => [u.id, u.name ?? undefined])),
    [users.items],
  );
  const actorName = useCallback((id: string) => names.get(id), [names]);
  const actorOptions = useMemo(
    () => users.items.map(u => ({ value: u.id, label: u.name ?? u.id })),
    [users.items],
  );

  const feed = useAuditFeed(
    (cursor, limit) =>
      api.listAuditEvents({
        cursor,
        limit,
        type: type ?? undefined,
        actorId: actorId ?? undefined,
      }),
    [type, actorId],
  );

  return {
    feed,
    type,
    setType,
    actorId,
    setActorId,
    actorOptions,
    actorName,
  };
};
