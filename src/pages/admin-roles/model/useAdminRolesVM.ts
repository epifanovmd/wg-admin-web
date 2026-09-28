import { ADMIN_PERMISSIONS, IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { IRoleDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useConfirm, useZodForm } from "@shared/ui";
import { z } from "zod";

export const newRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Не длиннее 100 символов.")
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      "Строчная латиница, цифры, - и _; начинается с буквы.",
    ),
});

export type TNewRoleForm = z.infer<typeof newRoleSchema>;

export const useAdminRolesVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const form = useZodForm(newRoleSchema, { defaultValues: { name: "" } });

  const canView = userStore.can(ADMIN_PERMISSIONS.ROLE_VIEW);

  const roles = useCollection<IRoleDto>({
    queryFn: () => api.getRoles(),
    keyExtractor: r => r.id,
    autoLoad: true,
    enabled: canView,
  });

  useSocketRoom("roles", canView ? "all" : null, () => roles.refresh());
  useSocketEvent<[IRoleDto]>(
    "role:updated",
    role => roles.upsertItem(role.id, role),
    canView,
  );
  useSocketEvent<[{ id: string }]>(
    "role:deleted",
    ({ id }) => roles.removeItem(id),
    canView,
  );

  const create = async ({ name }: TNewRoleForm) => {
    const res = await api.createRole({ name });

    if (!res.data) {
      notifyApiError(toast, res.error);

      return;
    }

    roles.upsertItem(res.data.id, res.data);
    form.reset({ name: "" });
    toast.success(`Роль ${name} создана`);
  };

  const savePermissions = async (role: IRoleDto, permissions: string[]) => {
    const res = await api.setRolePermissions(role.id, { permissions });

    if (!res.data) {
      notifyApiError(toast, res.error);

      return false;
    }

    roles.updateItem(role.id, res.data);
    toast.success(`Права роли ${role.name} сохранены`);

    return true;
  };

  const remove = async (role: IRoleDto) => {
    const ok = await confirm({
      title: `Удалить роль «${role.name}»?`,
      description: "Пользователи потеряют права этой роли.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.deleteRole(role.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    roles.removeItem(role.id);
  };

  return {
    roles: roles.items,
    isLoading: roles.isLoading,
    canCreate: userStore.can(ADMIN_PERMISSIONS.ROLE_CREATE),
    canUpdate: userStore.can(ADMIN_PERMISSIONS.ROLE_UPDATE),
    canDelete: userStore.can(ADMIN_PERMISSIONS.ROLE_DELETE),
    isSuperUser: userStore.isAdmin || userStore.can("*"),
    form,
    create,
    savePermissions,
    remove,
  };
};
