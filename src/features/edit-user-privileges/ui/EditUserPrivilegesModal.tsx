import { KNOWN_PERMISSIONS, PERMISSION_LABELS } from "@entities/user";
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
          size="md"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">Роли</legend>
              {vm.roleOptions.map(name => (
                <Checkbox
                  key={name}
                  label={name}
                  checked={vm.roles.includes(name)}
                  onCheckedChange={on => vm.toggleRole(name, on === true)}
                />
              ))}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold">
                Прямые права
              </legend>
              {KNOWN_PERMISSIONS.map(name => (
                <Checkbox
                  key={name}
                  label={PERMISSION_LABELS[name]}
                  description={name}
                  checked={vm.permissions.includes(name)}
                  onCheckedChange={on => vm.togglePermission(name, on === true)}
                />
              ))}
            </fieldset>
          </div>
        </ModalContent>
      </Modal>
    );
  });
