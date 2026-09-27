import type { IWgAgentReleaseInfo } from "@shared/api/gen/main/model";
import { Button, Tooltip } from "@shared/ui";
import { ArrowUpCircle } from "lucide-react";
import { FC } from "react";

import { resolveAgentUpdate, TAgentNode } from "../model/agent-update";

interface AgentUpdateButtonProps {
  node: TAgentNode;
  release: IWgAgentReleaseInfo | null;
  onUpdate: () => void;
  loading?: boolean;
}

/**
 * Обновление агента бинарём с бэкенда: видна, когда бинарь ноды отличается
 * от релиза.
 */
export const AgentUpdateButton: FC<AgentUpdateButtonProps> = ({
  node,
  release,
  onUpdate,
  loading,
}) => {
  if (resolveAgentUpdate(node, release) === "none") return null;

  return (
    <Tooltip
      content={`Доступна версия ${release?.version}: бинарь скачается с бэкенда, служба агента перезапустится`}
    >
      <span className="inline-flex">
        <Button
          variant="outline"
          leftIcon={<ArrowUpCircle size={15} />}
          loading={loading}
          onClick={onUpdate}
        >
          Обновить агента
        </Button>
      </span>
    </Tooltip>
  );
};
