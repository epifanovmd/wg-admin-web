import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import {
  useDeleteWgForward,
  useWgForwardFormVM,
} from "@features/manage-wg-forward";
import { IMainApi } from "@shared/api";
import type { EWgForwardRoute, WgForwardDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

/** Пробросы портов и действия с ними. */
export const useWgForwardsVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const canView = userStore.can(WG_PERMISSIONS.FORWARD_VIEW);

  const forwards = useCollection<WgForwardDto>({
    queryFn: async () => {
      const { data, error } = await api.listWgForwards({ limit: 100 });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: forward => forward.id,
    autoLoad: true,
    enabled: canView,
  });

  const upsert = (forward: WgForwardDto) =>
    forwards.upsertItem(forward.id, forward);

  const form = useWgForwardFormVM({ onSaved: upsert });
  const canCreate = userStore.can(WG_PERMISSIONS.FORWARD_CREATE);
  const canUpdate = userStore.can(WG_PERMISSIONS.FORWARD_UPDATE);

  useCloseWhenForbidden(form.open, form.editing ? canUpdate : canCreate, () =>
    form.setOpen(false),
  );
  const remove = useDeleteWgForward({
    onDeleted: forward => forwards.removeItem(forward.id),
  });

  // Изменения и смена активного маршрута (по отчёту агента) — событиями.
  useSocketRoom("wg-forwards", canView ? "all" : null, () =>
    forwards.refresh(),
  );
  useSocketEvent<[WgForwardDto]>("wg:forward:updated", upsert, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:forward:deleted",
    ({ id }) => forwards.removeItem(id),
    canView,
  );

  const patch = async (
    forward: WgForwardDto,
    body: { enabled?: boolean; route?: EWgForwardRoute },
  ): Promise<boolean> => {
    const res = await api.updateWgForward(forward.id, body);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    forwards.updateItem(forward.id, res.data);

    return true;
  };

  return {
    forwards,
    form,
    remove,
    toggle: (forward: WgForwardDto) =>
      patch(forward, { enabled: !forward.enabled }),
    setRoute: (forward: WgForwardDto, route: EWgForwardRoute) =>
      patch(forward, { route }),
    canCreate,
    canUpdate,
    canDelete: userStore.can(WG_PERMISSIONS.FORWARD_DELETE),
  };
};

export type WgForwardsVM = ReturnType<typeof useWgForwardsVM>;
