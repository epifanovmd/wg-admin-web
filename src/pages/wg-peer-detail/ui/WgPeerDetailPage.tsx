import { useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { WgPeerDetail } from "./WgPeerDetail";

/** Маршрут пира: другой пир — новое состояние страницы, без данных прежнего. */
export const WgPeerDetailPage: FC = observer(() => {
  const { peerId } = useParams({ from: "/_app/wg/peers/$peerId" });

  return <WgPeerDetail key={peerId} peerId={peerId} />;
});
