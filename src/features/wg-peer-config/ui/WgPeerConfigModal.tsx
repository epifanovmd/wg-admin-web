import { Button, Modal, ModalContent, Spinner } from "@shared/ui";
import { Download, QrCode } from "lucide-react";
import { FC } from "react";

import { useWgPeerConfigVM } from "../model/useWgPeerConfigVM";

type ConfigVM = ReturnType<typeof useWgPeerConfigVM>;

interface WgPeerConfigModalProps {
  vm: ConfigVM;
}

/** QR-код и файл конфигурации пира. */
export const WgPeerConfigModal: FC<WgPeerConfigModalProps> = ({ vm }) => (
  <Modal open={vm.peer !== null} onOpenChange={open => !open && vm.close()}>
    <ModalContent
      size="md"
      title={vm.peer ? `Подключение: ${vm.peer.name}` : ""}
      description="Отсканируйте QR в приложении WireGuard или скачайте .conf"
      footer={
        <>
          <Button
            variant="outline"
            leftIcon={<QrCode size={15} />}
            onClick={() => vm.setShowText(!vm.showText)}
          >
            {vm.showText ? "Показать QR" : "Показать текст"}
          </Button>
          <Button
            leftIcon={<Download size={15} />}
            onClick={vm.download}
            disabled={vm.config === null}
          >
            Скачать .conf
          </Button>
        </>
      }
    >
      {vm.loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : vm.showText && vm.config !== null ? (
        <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">
          {vm.config}
        </pre>
      ) : vm.qr ? (
        <div className="flex justify-center">
          <img
            src={vm.qr}
            alt="QR-код конфигурации WireGuard"
            className="h-64 w-64 rounded-lg bg-white p-2"
          />
        </div>
      ) : null}
    </ModalContent>
  </Modal>
);
