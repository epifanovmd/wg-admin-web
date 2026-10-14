import type { TWgNodeInstallMode } from "@shared/api/gen/main/model";
import { Button, Modal, ModalContent, Segmented } from "@shared/ui";
import { FC } from "react";

import type { WgNodeInstallCommandVM } from "../model/useWgNodeInstallCommandVM";
import { AgentInstallInstructions } from "./AgentInstallInstructions";

interface WgNodeInstallCommandModalProps {
  vm: WgNodeInstallCommandVM;
}

const MODES: { value: TWgNodeInstallMode; label: string }[] = [
  { value: "systemd", label: "Служба" },
  { value: "docker", label: "Docker" },
];

/** Выданная команда установки агента: показывается один раз; другой способ — новый токен. */
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
      <div className="flex flex-col gap-4">
        <Segmented<TWgNodeInstallMode>
          aria-label="Способ установки"
          value={vm.mode}
          disabled={vm.loading}
          options={MODES}
          onValueChange={mode => {
            if (mode !== vm.mode) void vm.issue(mode);
          }}
        />
        {vm.install && (
          <AgentInstallInstructions install={vm.install} mode={vm.mode} />
        )}
      </div>
    </ModalContent>
  </Modal>
);
