import { useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { WgNodeDetail } from "./WgNodeDetail";

/** Маршрут ноды: другая нода — новое состояние страницы, без данных прежней. */
export const WgNodeDetailPage: FC = observer(() => {
  const { nodeId } = useParams({ from: "/_app/wg/nodes/$nodeId" });

  return <WgNodeDetail key={nodeId} nodeId={nodeId} />;
});
