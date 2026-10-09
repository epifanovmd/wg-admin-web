import { ADMIN_PERMISSIONS, IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { ApiKeyDto } from "@shared/api/gen/main/model";
import { usePaged } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useConfirm } from "@shared/ui";

const PAGE_SIZE = 20;

export const useAdminApiKeysVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const userStore = IUserStore.useInstance();
  const canView = userStore.can(ADMIN_PERMISSIONS.APIKEY_VIEW);

  const keys = usePaged<ApiKeyDto>({
    pageSize: PAGE_SIZE,
    keyExtractor: k => k.id,
    queryFn: async ({ offset, limit }) => {
      const { data, error } = await api.listApiKeys({ offset, limit });

      return {
        data: data ? { data: data.items, totalCount: data.total } : null,
        error,
      };
    },
    autoLoad: true,
    enabled: canView,
  });

  // Новые ключи — первыми: созданный где-то ещё попадает на первую страницу.
  useSocketRoom("api-keys", canView ? "all" : null, () =>
    keys.reload({ refresh: true }),
  );
  useSocketEvent<[ApiKeyDto]>(
    "apikey:updated",
    key => {
      if (keys.items.some(item => item.id === key.id)) {
        keys.updateItem(key.id, key);
      } else {
        void keys.reload({ refresh: true });
      }
    },
    canView,
  );

  const revoke = async (key: ApiKeyDto) => {
    const ok = await confirm({
      title: `Отозвать ключ «${key.name}»?`,
      description: "Клиенты с этим ключом сразу потеряют доступ.",
      confirmLabel: "Отозвать",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.revokeApiKey(key.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    await keys.reload({ refresh: true });
  };

  const onCreated = () => {
    keys.goToPage(1, { refresh: true }).then();
  };

  return {
    keys,
    revoke,
    onCreated,
    canCreate: userStore.can(ADMIN_PERMISSIONS.APIKEY_CREATE),
    canRevoke: userStore.can(ADMIN_PERMISSIONS.APIKEY_REVOKE),
  };
};
