import {
  AUDIT_EVENT_TYPES,
  auditEventMeta,
  useAuditFeed,
} from "@entities/audit";
import { ADMIN_PERMISSIONS, IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { AuditEventDto, IUserOptionDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useCallback, useMemo, useState } from "react";

export const AUDIT_TYPE_OPTIONS = AUDIT_EVENT_TYPES.map(type => ({
  value: type,
  label: auditEventMeta(type).label,
}));

export const useAdminAuditVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const canView = userStore.can(ADMIN_PERMISSIONS.AUDIT_VIEW);
  // Имена авторов — из списка пользователей, без права на него — только id.
  const canViewUsers = userStore.can(ADMIN_PERMISSIONS.USER_VIEW);
  const [type, setType] = useState<string | null>(null);
  const [actorId, setActorId] = useState<string | null>(null);

  const users = useCollection<IUserOptionDto>({
    queryFn: async () => {
      const { data, error } = await api.getUserOptions();

      return { data: data?.data ?? null, error };
    },
    keyExtractor: u => u.id,
    autoLoad: true,
    enabled: canViewUsers,
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

  useSocketRoom("audit", canView ? "all" : null, feed.load);
  useSocketEvent<[AuditEventDto]>(
    "audit:created",
    event => {
      if (
        (!type || event.type === type) &&
        (!actorId || event.actorId === actorId)
      ) {
        feed.prepend(event);
      }
    },
    canView,
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
