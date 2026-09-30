import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS, wgOwners } from "@entities/wg";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";

/** Действия над конкретным интерфейсом по области прав. */
export interface IWgInterfaceRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  /** Включение, выключение, перезапуск. */
  canControl: boolean;
  canMove: boolean;
  /** Копии на других нодах: добавить, снять, закрепить обслуживающую. */
  canReplicas: boolean;
  /** Назначение и снятие владельца. */
  canAssign: boolean;
}

/** Нет ни одного действия — пока интерфейс не загружен. */
export const NO_INTERFACE_ACCESS: IWgInterfaceRowAccess = {
  canUpdate: false,
  canDelete: false,
  canControl: false,
  canMove: false,
  canReplicas: false,
  canAssign: false,
};

/**
 * Права на действия с интерфейсами: создание и действия над конкретным
 * интерфейсом (право на все или свой — владелец или создатель).
 */
export const useWgInterfaceAccess = () => {
  const userStore = IUserStore.useInstance();

  const accessOf = (iface: WgInterfaceDto): IWgInterfaceRowAccess => {
    const owners = wgOwners(iface);
    const can = (permission: string) => userStore.canOn(permission, owners);

    return {
      canUpdate: can(WG_PERMISSIONS.INTERFACE_UPDATE),
      canDelete: can(WG_PERMISSIONS.INTERFACE_DELETE),
      canControl: can(WG_PERMISSIONS.INTERFACE_CONTROL),
      canMove: can(WG_PERMISSIONS.INTERFACE_MOVE),
      canReplicas: can(WG_PERMISSIONS.INTERFACE_REPLICAS),
      canAssign: can(WG_PERMISSIONS.INTERFACE_ASSIGN),
    };
  };

  return {
    canCreate: userStore.can(WG_PERMISSIONS.INTERFACE_CREATE),
    accessOf,
    /** Меняется вместе с правами — ключ мемоизации колонок. */
    accessKey: userStore.accessKey,
  };
};

export type WgInterfaceAccess = ReturnType<typeof useWgInterfaceAccess>;

/** Есть ли хоть одно действие со строкой интерфейса. */
export const hasAnyInterfaceAction = (access: IWgInterfaceRowAccess): boolean =>
  Object.values(access).some(Boolean);
