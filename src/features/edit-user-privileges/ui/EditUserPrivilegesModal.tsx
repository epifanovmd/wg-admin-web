import { PermissionPicker } from "@entities/permission";
import type { UserDto } from "@shared/api/gen/main/model";
import { Button, Checkbox, Modal, ModalContent } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useEditUserPrivilegesVM } from "../model/useEditUserPrivilegesVM";

interface EditUserPrivilegesModalProps {
  /** Пользователь, чьи права правятся; `null` — модалка закрыта. */
  user: UserDto | null;
  onClose: () => void;
  onSaved: (user: UserDto) => void;
}

export const EditUserPrivilegesModal: FC<EditUserPrivilegesModalProps> =
  observer(({ user, onClose, onSaved }) => {
    const vm = useEditUserPrivilegesVM({
      user,
      onSaved: saved => {
        onSaved(saved);
        onClose();
      },
    });

    return (
      <Modal open={!!user} onOpenChange={open => !open && onClose()}>
        <ModalContent
          size="lg"
          title="Права пользователя"
          description={user?.email ?? user?.username ?? undefined}
          footer={
            <>
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button loading={vm.isSaving} onClick={vm.save}>
                Сохранить
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">Роли</legend>
              {vm.roleOptions.map(name => (
                <Checkbox
                  key={name}
                  label={name}
                  disabled={!vm.canEditRoles}
                  checked={vm.roles.includes(name)}
                  onCheckedChange={on => vm.toggleRole(name, on === true)}
                />
              ))}
            </fieldset>
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Прямые права</h3>
              <PermissionPicker
                selected={vm.permissions}
                onToggle={vm.togglePermission}
              />
            </section>
          </div>
        </ModalContent>
      </Modal>
    );
  });
