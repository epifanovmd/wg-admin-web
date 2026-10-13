import { Button, Modal, ModalContent } from "@shared/ui";
import { FC } from "react";

import type { WgNodeInstallCommandVM } from "../model/useWgNodeInstallCommandVM";
import { AgentInstallInstructions } from "./AgentInstallInstructions";

interface WgNodeInstallCommandModalProps {
  vm: WgNodeInstallCommandVM;
}

/** Выданная команда установки агента: показывается один раз. */
export const WgNodeInstallCommandModal: FC<WgNodeInstallCommandModalProps> = ({
  vm,
}) => (
  <Modal open={vm.install !== null} onOpenChange={open => !open && vm.close()}>
    <ModalContent
      size="md"
      title="Установка агента вручную"
      description="Новый агент ноды заменит прежнего: тот будет отозван"
      footer={<Button onClick={vm.close}>Готово</Button>}
    >
      {vm.install && <AgentInstallInstructions install={vm.install} />}
    </ModalContent>
  </Modal>
);
