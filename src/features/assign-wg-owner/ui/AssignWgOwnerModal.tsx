import { Button, Modal, ModalContent, Select } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { AssignWgOwnerVM } from "../model/useAssignWgOwnerVM";

interface AssignWgOwnerModalProps {
  vm: AssignWgOwnerVM;
}

/** Выбор владельца сущности; пустой выбор снимает владельца. */
export const AssignWgOwnerModal: FC<AssignWgOwnerModalProps> = observer(
  ({ vm }) => (
    <Modal open={vm.target !== null} onOpenChange={open => !open && vm.close()}>
      <ModalContent
        size="sm"
        title="Владелец"
        description={
          vm.target
            ? `${vm.target.title}: владелец видит и обслуживает её по правам «свои»`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={vm.close}>
              Отмена
            </Button>
            <Button loading={vm.isSaving} onClick={() => void vm.save()}>
              Сохранить
            </Button>
          </>
        }
      >
        <Select
          aria-label="Владелец"
          placeholder="не назначен"
          options={vm.userOptions}
          loading={vm.isLoadingUsers}
          value={vm.userId}
          search
          clearable
          onChange={value => vm.setUserId(value ?? null)}
        />
      </ModalContent>
    </Modal>
  ),
);
