import { Alert, Button, Modal, ModalContent, Select } from "@shared/ui";
import { FC } from "react";

import type { MoveWgInterfaceVM } from "../model/useMoveWgInterfaceVM";

/** Выбор ноды для переноса интерфейса. */
export const MoveWgInterfaceModal: FC<{ vm: MoveWgInterfaceVM }> = ({ vm }) => (
  <Modal open={vm.open} onOpenChange={open => !open && vm.close()}>
    <ModalContent
      title={
        vm.mode === "copy"
          ? `Копия ${vm.iface?.name ?? ""} на ноде`
          : `Перенос ${vm.iface?.name ?? ""}`
      }
      description={
        vm.mode === "copy"
          ? "Тот же ключ, адреса и всегда те же пиры. Релей точки подключения переключит клиентов на эту копию, если основная ляжет"
          : "Ключ и пиры переедут вместе с интерфейсом; агенты обеих нод применят изменения сами"
      }
      footer={
        <>
          <Button variant="outline" onClick={vm.close}>
            Отмена
          </Button>
          <Button
            disabled={!vm.nodeId}
            loading={vm.submitting}
            onClick={() => void vm.submit()}
          >
            {vm.mode === "copy" ? "Скопировать" : "Перенести"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Select
          value={vm.nodeId}
          onChange={vm.setNodeId}
          options={vm.options}
          placeholder="Нода назначения"
          aria-label="Нода назначения"
        />
        {vm.copyWithoutEndpoint && (
          <Alert variant="warning" title="Нет точки подключения">
            Клиенты подключаются к publicHost основной ноды и на копию сами не
            перейдут. Резерв работает через точку подключения с релеем.
          </Alert>
        )}
        {vm.changesClientConfigs && (
          <Alert variant="warning" title="Клиентские конфиги изменятся">
            У интерфейса нет точки подключения: клиенты подключаются к
            publicHost ноды — после переноса конфиги пиров нужно выдать заново.
          </Alert>
        )}
      </div>
    </ModalContent>
  </Modal>
);
