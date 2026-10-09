import { WgNodeInstallCommandButton } from "@features/manage-wg-node";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { Button } from "@shared/ui";
import {
  HardDriveDownload,
  PackageX,
  Pencil,
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

/** Действия с нодой в шапке: установка агента, изменение и удаление. */
export const NodeHeaderActions: FC<NodeHeaderActionsProps> = observer(
  ({ vm, node }) => (
    <div className="flex flex-wrap gap-2">
      {vm.canProvision && (
        <Button
          variant="outline"
          leftIcon={<HardDriveDownload size={15} />}
          onClick={() => vm.provision.openFor(node)}
        >
          Установить агента
        </Button>
      )}
      {vm.canProvision && node.agentId && (
        <Button
          variant="outline"
          leftIcon={<PackageX size={15} />}
          onClick={() => vm.provision.openFor(node, "uninstall")}
        >
          Удалить агента
        </Button>
      )}
      {vm.canAgent && <WgNodeInstallCommandButton nodeId={node.id} />}
      {vm.canUpdate && (
        <Button
          variant="outline"
          leftIcon={<Pencil size={15} />}
          onClick={() => vm.nodeForm.openEdit(node)}
        >
          Изменить
        </Button>
      )}
      {vm.canAssign && (
        <Button
          variant="outline"
          leftIcon={<UserCog size={15} />}
          onClick={vm.openOwner}
        >
          Владелец
        </Button>
      )}
      {vm.canDelete && (
        <Button
          variant="destructive"
          leftIcon={<Trash2 size={15} />}
          onClick={() => void vm.removeNode(node)}
        >
          Удалить
        </Button>
      )}
    </div>
  ),
);
