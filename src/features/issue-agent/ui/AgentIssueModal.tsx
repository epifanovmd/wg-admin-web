import type { WgNodeDto } from "@shared/api/gen/main/model";
import { Modal, ModalContent } from "@shared/ui";
import { FC } from "react";

import { AgentIssuePanel } from "./AgentIssuePanel";

interface AgentIssueModalProps {
  /** Нода, для которой выдаём архив; `null` — окно закрыто. */
  node: WgNodeDto | null;
  onClose: () => void;
}

/** Архив агента ноды для получателя: с `.env` и одноразовым токеном, ссылкой или только `.env`. */
export const AgentIssueModal: FC<AgentIssueModalProps> = ({
  node,
  onClose,
}) => (
  <Modal open={node !== null} onOpenChange={open => !open && onClose()}>
    <ModalContent
      size="md"
      title={`Архив агента: ${node?.name ?? ""}`}
      description="Получатель запустит агента сам; агент привяжется к этой ноде"
    >
      {node && <AgentIssuePanel key={node.id} target={{ node }} />}
    </ModalContent>
  </Modal>
);
