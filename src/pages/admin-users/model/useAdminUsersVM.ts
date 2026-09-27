import { IUserStore } from "@entities/user";
import { useDebouncedValue } from "@mantine/hooks";
import { IMainApi } from "@shared/api";
import { KnownPermission, type UserDto } from "@shared/api/gen/main/model";
import { usePaged } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";
import { useState } from "react";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 300;

export const useAdminUsersVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE);
  const [editing, setEditing] = useState<UserDto | null>(null);

  const users = usePaged<UserDto, string>({
    pageSize: PAGE_SIZE,
    keyExtractor: u => u.id,
    watch: [query],
    queryFn: async ({ offset, limit }, q) => {
      const { data, error } = await api.getUsers({
        offset,
        limit,
        query: q || undefined,
      });

      return {
        data: data ? { data: data.items, totalCount: data.total } : null,
        error,
      };
    },
  });

  const remove = async (user: UserDto) => {
    const ok = await confirm({
      title: "Удалить пользователя?",
      description: user.email ?? user.username ?? user.id,
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.deleteUser(user.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    await users.reload({ refresh: true });
  };

  return {
    users,
    search,
    setSearch,
    editing,
    edit: setEditing,
    closeEdit: () => setEditing(null),
    onSaved: (saved: UserDto) => users.updateItem(saved.id, saved),
    remove,
    canManage: userStore.can(KnownPermission["user:manage"]),
    currentUserId: userStore.user?.id,
  };
};
