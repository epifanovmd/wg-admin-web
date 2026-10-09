import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS, wgOwners } from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
import { useDeleteWgSocks, useWgSocksFormVM } from "@features/manage-wg-socks";
import { IMainApi } from "@shared/api";
import type {
  IWgSocksLive,
  WgSocksClientDto,
  WgSocksServiceDto,
  WgSocksUserDto,
} from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { downloadBlob } from "@shared/lib/utils";
import { useConfirm } from "@shared/ui";
import { useState } from "react";

import { type ISocksSecret, macClientFileName } from "./socks-links";
import { type INamePrompt, useSocksNamePromptVM } from "./useSocksNamePromptVM";

/** Действия над конкретным прокси по области прав. */
export interface IWgSocksRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canViewSecrets: boolean;
  canManageClients: boolean;
  canAssign: boolean;
}

/**
 * Прокси (SOCKS5 через mTLS): сервисы, их пользователи и устройства. С
 * областью «свои» — только свои прокси (владелец или создатель); действия —
 * по сервису.
 */
export const useWgSocksVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const confirm = useConfirm();
  const viewScope = userStore.scope(WG_PERMISSIONS.SOCKS_VIEW);
  const canView = viewScope !== null;

  const accessOf = (service: WgSocksServiceDto): IWgSocksRowAccess => {
    const owners = wgOwners(service);
    const can = (permission: string) => userStore.canOn(permission, owners);

    return {
      canUpdate: can(WG_PERMISSIONS.SOCKS_UPDATE),
      canDelete: can(WG_PERMISSIONS.SOCKS_DELETE),
      canManageUsers: can(WG_PERMISSIONS.SOCKS_USERS),
      canViewSecrets: can(WG_PERMISSIONS.SOCKS_SECRETS),
      canManageClients: can(WG_PERMISSIONS.SOCKS_CLIENTS),
      canAssign: can(WG_PERMISSIONS.SOCKS_ASSIGN),
    };
  };
  const [secret, setSecret] = useState<ISocksSecret | null>(null);

  const services = useCollection<WgSocksServiceDto>({
    queryFn: () => api.listWgSocks(),
    keyExtractor: service => service.id,
    autoLoad: true,
    enabled: canView,
  });

  const upsert = (service: WgSocksServiceDto) =>
    services.upsertItem(service.id, service);

  const form = useWgSocksFormVM({ onSaved: upsert });
  const remove = useDeleteWgSocks({
    onDeleted: service => services.removeItem(service.id),
  });

  // Изменения (пользователи, сертификаты) и статистика агента — событиями.
  // Все прокси — из комнаты списка; свои приходят адресно.
  useSocketRoom("wg-socks", viewScope === "all" ? "all" : null, () =>
    services.refresh(),
  );
  useSocketEvent<[WgSocksServiceDto]>("wg:socks:updated", upsert, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:socks:deleted",
    ({ id }) => services.removeItem(id),
    canView,
  );
  useSocketEvent<[{ id: string; live: IWgSocksLive }]>(
    "wg:socks:stats",
    ({ id, live }) => {
      const service = services.items.find(item => item.id === id);

      if (service) services.updateItem(id, { ...service, live });
    },
    canView,
  );

  /** Ошибка — тост и false; успех — перечитать карточку прокси. */
  const done = async (
    service: WgSocksServiceDto,
    res: { error?: unknown },
  ): Promise<boolean> => {
    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    const fresh = await api.getWgSocks(service.id);

    if (fresh.data) services.updateItem(service.id, fresh.data);

    return true;
  };

  const toggle = async (service: WgSocksServiceDto): Promise<boolean> => {
    const res = await api.updateWgSocks(service.id, {
      enabled: !service.enabled,
    });

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    services.updateItem(service.id, res.data);

    return true;
  };

  /** Новый пользователь (сразу показать пароль) или устройство. */
  const create = async (
    { kind, service }: INamePrompt,
    name: string,
  ): Promise<boolean> => {
    if (kind === "client") {
      return done(service, await api.issueWgSocksClient(service.id, { name }));
    }

    const res = await api.addWgSocksUser(service.id, { username: name });

    if (!(await done(service, res)) || !res.data) return false;
    setSecret({ serviceName: service.name, ...res.data });

    return true;
  };

  const namePrompt = useSocksNamePromptVM({ onSubmit: create });
  const canCreate = userStore.can(WG_PERMISSIONS.SOCKS_CREATE);
  const owner = useAssignWgOwnerVM<WgSocksServiceDto>({ onSaved: upsert });

  const openOwner = (service: WgSocksServiceDto) =>
    owner.openFor({
      title: `Прокси ${service.name}`,
      ownerId: service.ownerId,
      assign: userId => api.assignWgSocks(service.id, { userId }),
      revoke: () => api.revokeWgSocks(service.id),
    });

  const toggleUser = async (service: WgSocksServiceDto, user: WgSocksUserDto) =>
    done(
      service,
      await api.updateWgSocksUser(service.id, user.id, {
        enabled: !user.enabled,
      }),
    );

  const removeUser = async (
    service: WgSocksServiceDto,
    user: WgSocksUserDto,
  ) => {
    const ok = await confirm({
      title: `Удалить пользователя «${user.username}»?`,
      description: "Его подключения оборвутся сразу.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (ok) {
      await done(service, await api.removeWgSocksUser(service.id, user.id));
    }
  };

  const showSecret = async (
    service: WgSocksServiceDto,
    user: WgSocksUserDto,
  ) => {
    const res = await api.getWgSocksUserSecret(service.id, user.id);

    if (res.error) notifyApiError(toast, res.error);
    else setSecret({ serviceName: service.name, ...res.data });
  };

  const revokeClient = async (
    service: WgSocksServiceDto,
    client: WgSocksClientDto,
  ) => {
    const ok = await confirm({
      title: `Отозвать сертификат «${client.name}»?`,
      description:
        "Устройство с этим сертификатом больше не подключится, открытые соединения оборвутся. Отменить нельзя — создайте новый.",
      confirmLabel: "Отозвать",
      confirmVariant: "destructive",
    });

    if (ok) {
      await done(service, await api.revokeWgSocksClient(service.id, client.id));
    }
  };

  /** Готовый клиент для Mac: сертификат устройства + логин пользователя. */
  const downloadMac = async (
    service: WgSocksServiceDto,
    client: WgSocksClientDto,
    userId?: string,
  ) => {
    const res = await api.getWgSocksMacClient(service.id, client.id, {
      userId,
    });

    if (res.error) notifyApiError(toast, res.error);
    else downloadBlob(res.data, macClientFileName(service.name));
  };

  const prompted = namePrompt.prompt
    ? accessOf(namePrompt.prompt.service)
    : null;

  useCloseWhenForbidden(
    form.open,
    form.editing ? accessOf(form.editing).canUpdate : canCreate,
    () => form.setOpen(false),
  );
  useCloseWhenForbidden(
    !!prompted,
    namePrompt.prompt?.kind === "client"
      ? !!prompted?.canManageClients
      : !!prompted?.canManageUsers,
    namePrompt.close,
  );
  useCloseWhenForbidden(
    !!secret,
    userStore.scope(WG_PERMISSIONS.SOCKS_SECRETS) !== null,
    () => setSecret(null),
  );

  return {
    services,
    form,
    remove,
    toggle,
    namePrompt,
    toggleUser,
    removeUser,
    showSecret,
    secret,
    closeSecret: () => setSecret(null),
    revokeClient,
    downloadMac,
    owner,
    openOwner,
    canCreate,
    /** Действия над прокси: право на все или свой. */
    accessOf,
  };
};

export type WgSocksVM = ReturnType<typeof useWgSocksVM>;
