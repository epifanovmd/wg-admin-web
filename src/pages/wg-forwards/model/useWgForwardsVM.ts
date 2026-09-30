import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS, wgOwners } from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
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

/** Действия над конкретным пробросом по области прав. */
export interface IWgForwardRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  canAssign: boolean;
}

/**
 * Пробросы портов и действия с ними. С областью «свои» — только свои
 * пробросы (владелец или создатель); действия — по строке.
 */
export const useWgForwardsVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const viewScope = userStore.scope(WG_PERMISSIONS.FORWARD_VIEW);
  const canView = viewScope !== null;

  const accessOf = (forward: WgForwardDto): IWgForwardRowAccess => {
    const owners = wgOwners(forward);

    return {
      canUpdate: userStore.canOn(WG_PERMISSIONS.FORWARD_UPDATE, owners),
      canDelete: userStore.canOn(WG_PERMISSIONS.FORWARD_DELETE, owners),
      canAssign: userStore.canOn(WG_PERMISSIONS.FORWARD_ASSIGN, owners),
    };
  };

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
  const owner = useAssignWgOwnerVM<WgForwardDto>({ onSaved: upsert });

  const openOwner = (forward: WgForwardDto) =>
    owner.openFor({
      title: `Проброс ${forward.name}`,
      ownerId: forward.ownerId,
      assign: userId => api.assignWgForward(forward.id, { userId }),
      revoke: () => api.revokeWgForward(forward.id),
    });

  useCloseWhenForbidden(
    form.open,
    form.editing ? accessOf(form.editing).canUpdate : canCreate,
    () => form.setOpen(false),
  );
  const remove = useDeleteWgForward({
    onDeleted: forward => forwards.removeItem(forward.id),
  });

  // Изменения и смена активного маршрута (по отчёту агента) — событиями.
  // Все пробросы — из комнаты списка; свои приходят адресно.
  useSocketRoom("wg-forwards", viewScope === "all" ? "all" : null, () =>
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
    owner,
    openOwner,
    canCreate,
    /** Действия над пробросом: право на все или свой. */
    accessOf,
    accessKey: userStore.accessKey,
  };
};

export type WgForwardsVM = ReturnType<typeof useWgForwardsVM>;
