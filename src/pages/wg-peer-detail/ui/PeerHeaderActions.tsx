import { WgToggleSwitch } from "@entities/wg";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { Button } from "@shared/ui";
import { Pencil, QrCode } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgPeerDetailVM } from "../model/useWgPeerDetailVM";

interface PeerHeaderActionsProps {
  vm: WgPeerDetailVM;
  peer: WgPeerDto;
}

/** Действия с пиром в шапке: включение, конфиг, изменение. */
export const PeerHeaderActions: FC<PeerHeaderActionsProps> = observer(
  ({ vm, peer }) => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 text-sm">
        <WgToggleSwitch enabled={peer.enabled} onToggle={vm.toggle} />
        Включён
      </span>
      {peer.hasPrivateKey && (
        <Button
          leftIcon={<QrCode size={15} />}
          onClick={() => void vm.config.openFor(peer)}
        >
          QR и конфиг
        </Button>
      )}
      {vm.canManage && (
        <Button
          variant="outline"
          leftIcon={<Pencil size={15} />}
          onClick={() => vm.form.openEdit(peer)}
        >
          Изменить
        </Button>
      )}
    </div>
  ),
);
