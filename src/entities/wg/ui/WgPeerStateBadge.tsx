import type { WgPeerDto } from "@shared/api/gen/main/model";
import { Badge, Tooltip } from "@shared/ui";
import { FC } from "react";

import { formatHandshakeAgo } from "../lib/format";
import { peerStateView } from "../lib/status";

interface WgPeerStateBadgeProps {
  peer: Pick<
    WgPeerDto,
    "enabled" | "isOnline" | "disabledReason" | "lastHandshakeAt"
  >;
}

export const WgPeerStateBadge: FC<WgPeerStateBadgeProps> = ({ peer }) => {
  const view = peerStateView(peer);

  return (
    <Tooltip content={`Handshake: ${formatHandshakeAgo(peer.lastHandshakeAt)}`}>
      <Badge variant={view.variant} dot>
        {view.label}
      </Badge>
    </Tooltip>
  );
};
