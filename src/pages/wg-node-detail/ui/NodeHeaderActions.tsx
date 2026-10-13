import {
  useWgNodeInstallCommandVM,
  WgNodeInstallCommandModal,
} from "@features/manage-wg-node";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpCircle,
  HardDriveDownload,
  KeyRound,
  MoreHorizontal,
  PackageX,
  Pencil,
  Server,
  Terminal,
  Trash2,
  UserCog,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgNodeDetailVM } from "../model/useWgNodeDetailVM";

interface NodeHeaderActionsProps {
  vm: WgNodeDetailVM;
  node: WgNodeDto;
}

/**
 * Действия в шапке ноды. На виду — главное: установка агента (его нет или он
 * не на связи), обновление агента и изменение ноды; остальное — в меню.
 */
export const NodeHeaderActions: FC<NodeHeaderActionsProps> = observer(
  ({ vm, node }) => {
    const { agent, agentActions } = vm;
    const installCommand = useWgNodeInstallCommandVM(node.id);

    const canInstall = vm.canProvision && !agent?.online;
    const canUninstall = vm.canProvision && !!node.agentId;
    const rotatable = vm.canRotate ? agent : undefined;
    const agentId = vm.canViewAgents ? node.agentId : undefined;
    const hasManage = vm.canAgent || !!rotatable || vm.canAssign || !!agentId;
    const hasRemove = canUninstall || vm.canDelete;

    return (
      <div className="flex items-center gap-2">
        {canInstall && (
          <Button
            variant="outline"
            leftIcon={<HardDriveDownload size={15} />}
            onClick={() => vm.provision.openFor(node)}
          >
            Установить агента
          </Button>
        )}
        {agent && vm.canUpdateAgent && (
          <Tooltip
            content={
              vm.updateTarget
                ? `Доступна версия ${vm.updateTarget}: агент скачает её, проверит подпись и перезапустится`
                : "Есть новая версия: агент скачает её, проверит подпись и перезапустится"
            }
          >
            <span className="inline-flex">
              <Button
                variant="outline"
                leftIcon={<ArrowUpCircle size={15} />}
                loading={agentActions.isBusy("update", agent.id)}
                onClick={() => void agentActions.update(agent, vm.updateTarget)}
              >
                Обновить агента
              </Button>
            </span>
          </Tooltip>
        )}
        {vm.canUpdate && (
          <Button
            variant="outline"
            leftIcon={<Pencil size={15} />}
            onClick={() => vm.nodeForm.openEdit(node)}
          >
            Изменить
          </Button>
        )}
        {(hasManage || hasRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="px-2.5"
                aria-label="Ещё действия"
                loading={
                  installCommand.loading ||
                  (!!rotatable && agentActions.isBusy("rotate", rotatable.id))
                }
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {vm.canAgent && (
                <DropdownMenuItem
                  icon={<Terminal size={15} />}
                  onSelect={() => void installCommand.issue()}
                >
                  Команда установки
                </DropdownMenuItem>
              )}
              {rotatable && (
                <DropdownMenuItem
                  icon={<KeyRound size={15} />}
                  onSelect={() => void agentActions.rotateKey(rotatable)}
                >
                  Сменить ключ
                </DropdownMenuItem>
              )}
              {vm.canAssign && (
                <DropdownMenuItem
                  icon={<UserCog size={15} />}
                  onSelect={vm.openOwner}
                >
                  Владелец
                </DropdownMenuItem>
              )}
              {agentId && (
                <DropdownMenuItem asChild>
                  <Link to="/agents/$agentId" params={{ agentId }}>
                    <Server size={15} className="text-muted-foreground" />
                    Страница агента
                  </Link>
                </DropdownMenuItem>
              )}
              {hasManage && hasRemove && <DropdownMenuSeparator />}
              {canUninstall && (
                <DropdownMenuItem
                  variant="destructive"
                  icon={<PackageX size={15} />}
                  onSelect={() => vm.provision.openFor(node, "uninstall")}
                >
                  Удалить агента
                </DropdownMenuItem>
              )}
              {vm.canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  icon={<Trash2 size={15} />}
                  onSelect={() => void vm.removeNode(node)}
                >
                  Удалить ноду
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <WgNodeInstallCommandModal vm={installCommand} />
      </div>
    );
  },
);
