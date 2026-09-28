import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { useMemo } from "react";

/** Какие действия с интерфейсами доступны текущему пользователю. */
export interface IWgInterfacePermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  /** Включение, выключение, перезапуск. */
  canControl: boolean;
  canMove: boolean;
  /** Копии на других нодах: добавить, снять, закрепить обслуживающую. */
  canReplicas: boolean;
}

/** Права на действия с интерфейсами; объект стабилен, пока права те же. */
export const useWgInterfacePermissions = (): IWgInterfacePermissions => {
  const userStore = IUserStore.useInstance();
  const canCreate = userStore.can(WG_PERMISSIONS.INTERFACE_CREATE);
  const canUpdate = userStore.can(WG_PERMISSIONS.INTERFACE_UPDATE);
  const canDelete = userStore.can(WG_PERMISSIONS.INTERFACE_DELETE);
  const canControl = userStore.can(WG_PERMISSIONS.INTERFACE_CONTROL);
  const canMove = userStore.can(WG_PERMISSIONS.INTERFACE_MOVE);
  const canReplicas = userStore.can(WG_PERMISSIONS.INTERFACE_REPLICAS);

  return useMemo(
    () => ({
      canCreate,
      canUpdate,
      canDelete,
      canControl,
      canMove,
      canReplicas,
    }),
    [canCreate, canUpdate, canDelete, canControl, canMove, canReplicas],
  );
};

/** Есть ли хоть одно действие со строкой интерфейса. */
export const hasAnyInterfaceAction = (p: IWgInterfacePermissions): boolean =>
  p.canUpdate || p.canDelete || p.canControl || p.canMove || p.canReplicas;
