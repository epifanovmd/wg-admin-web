import { IMainApi } from "@shared/api";
import type { IWgNodeInstallCommandDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { Button, Modal, ModalContent } from "@shared/ui";
import { Terminal } from "lucide-react";
import { FC, useState } from "react";

import { AgentInstallInstructions } from "./AgentInstallInstructions";

interface WgNodeInstallCommandButtonProps {
  nodeId: string;
}

/**
 * Команда установки агента с новым одноразовым токеном: для установки вручную
 * или переустановки. Агент, который уже работает, остаётся на связи до
 * регистрации нового.
 */
export const WgNodeInstallCommandButton: FC<
  WgNodeInstallCommandButtonProps
> = ({ nodeId }) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [install, setInstall] = useState<IWgNodeInstallCommandDto | null>(null);
  const [loading, setLoading] = useState(false);

  const issue = async () => {
    setLoading(true);

    const res = await api.createWgNodeInstallCommand(nodeId, {});

    setLoading(false);
    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setInstall(res.data);
  };

  return (
    <>
      <Button
        variant="outline"
        leftIcon={<Terminal size={15} />}
        loading={loading}
        onClick={issue}
      >
        Команда установки
      </Button>

      <Modal
        open={install !== null}
        onOpenChange={open => !open && setInstall(null)}
      >
        <ModalContent
          size="md"
          title="Установка агента вручную"
          description="Новый агент ноды заменит прежнего: тот будет отозван"
          footer={<Button onClick={() => setInstall(null)}>Готово</Button>}
        >
          {install && <AgentInstallInstructions install={install} />}
        </ModalContent>
      </Modal>
    </>
  );
};
