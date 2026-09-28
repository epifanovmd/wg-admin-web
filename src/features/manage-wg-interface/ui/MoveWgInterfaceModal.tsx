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
        {vm.copyWithoutRelay !== null && (
          <Alert variant="warning" title="Трафик на копию сам не переключится">
            {vm.copyWithoutRelay
              ? `Точка «${vm.copyWithoutRelay}» — адрес ноды: клиенты ходят прямо на основную ноду.`
              : "У интерфейса нет точки подключения: клиенты ходят на адрес основной ноды."}{" "}
            Копия останется резервом для ручного переноса; автоматическое
            переключение — через точку с релеем панели.
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
