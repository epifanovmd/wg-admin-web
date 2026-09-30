import { WgToggleSwitch } from "@entities/wg";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Button } from "@shared/ui";
import {
  ArrowRightLeft,
  Copy,
  Pencil,
  RotateCcw,
  Trash2,
  UserCog,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgInterfaceDetailVM } from "../model/useWgInterfaceDetailVM";

interface InterfaceSectionProps {
  vm: WgInterfaceDetailVM;
  iface: WgInterfaceDto;
}

/** Действия с интерфейсом в шапке. */
export const InterfaceActions: FC<InterfaceSectionProps> = observer(
  ({ vm, iface }) => (
    <div className="flex flex-wrap items-center gap-2">
      {vm.permissions.canControl && (
        <WgToggleSwitch
          enabled={iface.enabled}
          onToggle={() => vm.actions.toggle(iface)}
        />
      )}
      {vm.permissions.canUpdate && (
        <Button
          variant="outline"
          leftIcon={<Pencil size={15} />}
          onClick={() => vm.form.openEdit(iface)}
        >
          Изменить
        </Button>
      )}
      {vm.permissions.canControl && (
        <Button
          variant="outline"
          leftIcon={<RotateCcw size={15} />}
          onClick={() => void vm.actions.restart(iface)}
        >
          Перезапустить
        </Button>
      )}
      {vm.permissions.canMove && (
        <Button
          variant="outline"
          leftIcon={<ArrowRightLeft size={15} />}
          onClick={() => vm.move.openFor(iface)}
        >
          Перенести
        </Button>
      )}
      {vm.permissions.canReplicas && (
        <Button
          variant="outline"
          leftIcon={<Copy size={15} />}
          onClick={() => vm.move.openFor(iface, "copy")}
        >
          Копия
        </Button>
      )}
      {vm.permissions.canAssign && (
        <Button
          variant="outline"
          leftIcon={<UserCog size={15} />}
          onClick={vm.openOwner}
        >
          Владелец
        </Button>
      )}
      {vm.permissions.canDelete && (
        <Button
          variant="destructive"
          leftIcon={<Trash2 size={15} />}
          onClick={() => void vm.actions.remove(iface)}
        >
          Удалить
        </Button>
      )}
    </div>
  ),
);
