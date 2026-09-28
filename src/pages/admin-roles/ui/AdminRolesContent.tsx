import { Button, Card, Form, InputFormField, Skeleton } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { TNewRoleForm, useAdminRolesVM } from "../model/useAdminRolesVM";
import { RolePermissionsCard } from "./RolePermissionsCard";

export const AdminRolesContent: FC = observer(() => {
  const vm = useAdminRolesVM();

  return (
    <>
      {vm.canCreate && (
        <Card title="Новая роль">
          <Form
            form={vm.form}
            onSubmit={vm.create}
            className="flex flex-col gap-3"
          >
            <InputFormField<TNewRoleForm>
              name="name"
              label="Название"
              placeholder="moderator"
            />
            <Button
              type="submit"
              className="self-start"
              leftIcon={<Plus size={15} />}
              loading={vm.form.formState.isSubmitting}
            >
              Создать
            </Button>
          </Form>
        </Card>
      )}
      {vm.isLoading && vm.roles.length === 0 ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="flex flex-col gap-4">
          {vm.roles.map(role => (
            <RolePermissionsCard
              key={role.id}
              role={role}
              canUpdate={vm.canUpdate}
              canDelete={vm.canDelete}
              canGrantAll={vm.isSuperUser}
              onSave={vm.savePermissions}
              onDelete={vm.remove}
            />
          ))}
        </div>
      )}
    </>
  );
});
