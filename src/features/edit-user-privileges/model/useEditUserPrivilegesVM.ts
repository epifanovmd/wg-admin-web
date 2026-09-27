import { IMainApi } from "@shared/api";
import type { IRoleDto, UserDto } from "@shared/api/gen/main/model";
import { useCollection, useMutation } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useEffect, useState } from "react";

interface UseEditUserPrivilegesOptions {
  user: UserDto | null;
  onSaved: (user: UserDto) => void;
}

const toggle = (list: string[], value: string, on: boolean): string[] =>
  on ? [...new Set([...list, value])] : list.filter(v => v !== value);

/** Роли и прямые права пользователя; сохраняются одним запросом. */
export const useEditUserPrivilegesVM = ({
  user,
  onSaved,
}: UseEditUserPrivilegesOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const allRoles = useCollection<IRoleDto>({
    queryFn: () => api.getRoles(),
    keyExtractor: r => r.id,
  });

  useEffect(() => {
    if (!user) return;

    setRoles(user.roles.map(r => r.name));
    setPermissions(user.directPermissions.map(p => p.name));
    if (!allRoles.isSuccess) allRoles.load().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = useMutation<void, UserDto>({
    mutationFn: async () =>
      user
        ? api.setPrivileges(user.id, { roles, permissions })
        : { data: null, error: null },
    onSuccess: saved => {
      toast.success("Права пользователя сохранены");
      onSaved(saved);
    },
    onError: error => notifyApiError(toast, error),
  });

  return {
    roleOptions: allRoles.items.map(r => r.name),
    roles,
    permissions,
    toggleRole: (name: string, on: boolean) =>
      setRoles(list => toggle(list, name, on)),
    togglePermission: (name: string, on: boolean) =>
      setPermissions(list => toggle(list, name, on)),
    isSaving: save.isLoading,
    save: () => save.mutate(),
  };
};
