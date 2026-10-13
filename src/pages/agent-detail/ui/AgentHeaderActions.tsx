import type { AgentDto } from "@shared/api/gen/main/model";
import { Button, Tooltip } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpCircle,
  Ban,
  KeyRound,
  ListChecks,
  Network,
  Trash2,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { AgentDetailVM } from "../model/useAgentDetailVM";

interface AgentHeaderActionsProps {
  vm: AgentDetailVM;
  agent: AgentDto;
}

/** Шапка агента: узел, его задачи; обновление, ключ, отзыв и удаление. */
export const AgentHeaderActions: FC<AgentHeaderActionsProps> = observer(
  ({ vm, agent }) => {
    const { actions, updateTo } = vm;

    return (
      <div className="flex flex-wrap gap-2">
        {vm.node && (
          <Button variant="ghost" leftIcon={<Network size={15} />} asChild>
            <Link to="/wg/nodes/$nodeId" params={{ nodeId: vm.node.id }}>
              Нода {vm.node.name}
            </Link>
          </Button>
        )}
        <Tooltip content="Мои задачи, которые выполнял этот агент">
          <Button variant="ghost" leftIcon={<ListChecks size={15} />} asChild>
            <Link to="/jobs" search={{ agent: agent.id }}>
              Задачи
            </Link>
          </Button>
        </Tooltip>
        {updateTo && (
          <Tooltip
            content={`Доступна версия ${updateTo}: агент скачает её, проверит подпись и перезапустится`}
          >
            <span className="inline-flex">
              <Button
                variant="outline"
                leftIcon={<ArrowUpCircle size={15} />}
                loading={actions.isBusy("update", agent.id)}
                onClick={() => void actions.update(agent, updateTo)}
              >
                Обновить агента
              </Button>
            </span>
          </Tooltip>
        )}
        {vm.canRotate && (
          <Button
            variant="outline"
            leftIcon={<KeyRound size={15} />}
            loading={actions.isBusy("rotate", agent.id)}
            onClick={() => void actions.rotateKey(agent)}
          >
            Сменить ключ
          </Button>
        )}
        {vm.canRevoke && (
          <Button
            variant="destructive"
            leftIcon={<Ban size={15} />}
            loading={actions.isBusy("revoke", agent.id)}
            onClick={() => void actions.revoke(agent)}
          >
            Отозвать
          </Button>
        )}
        {vm.canDelete && (
          <Button
            variant="destructive"
            leftIcon={<Trash2 size={15} />}
            loading={actions.isBusy("remove", agent.id)}
            onClick={() => void actions.remove(agent)}
          >
            Удалить
          </Button>
        )}
      </div>
    );
  },
);
