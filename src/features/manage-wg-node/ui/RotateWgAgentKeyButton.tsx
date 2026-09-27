import { IMainApi } from "@shared/api";
import type { IWgAgentKeyDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { Button, Modal, ModalContent, useConfirm } from "@shared/ui";
import { KeyRound } from "lucide-react";
import { FC, useState } from "react";

import { AgentKeyInstructions } from "./AgentKeyInstructions";

interface RotateWgAgentKeyButtonProps {
  nodeId: string;
}

/** Перевыпуск ключа агента: старый отзывается сразу. */
export const RotateWgAgentKeyButton: FC<RotateWgAgentKeyButtonProps> = ({
  nodeId,
}) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const [issued, setIssued] = useState<IWgAgentKeyDto | null>(null);
  const [loading, setLoading] = useState(false);

  const rotate = async () => {
    const ok = await confirm({
      title: "Перевыпустить ключ агента?",
      description:
        "Старый ключ перестанет работать сразу — агента на VPS нужно переустановить с новым ключом.",
      confirmLabel: "Перевыпустить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    setLoading(true);

    const res = await api.rotateWgAgentKey(nodeId);

    setLoading(false);
    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setIssued(res.data);
  };

  return (
    <>
      <Button
        variant="outline"
        leftIcon={<KeyRound size={15} />}
        loading={loading}
        onClick={rotate}
      >
        Ключ агента
      </Button>

      <Modal
        open={issued !== null}
        onOpenChange={open => !open && setIssued(null)}
      >
        <ModalContent
          size="md"
          title="Новый ключ агента"
          footer={<Button onClick={() => setIssued(null)}>Готово</Button>}
        >
          {issued && <AgentKeyInstructions issued={issued} />}
        </ModalContent>
      </Modal>
    </>
  );
};
