import { useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { WgInterfaceDetail } from "./WgInterfaceDetail";

/** Маршрут интерфейса: другой интерфейс — новое состояние страницы. */
export const WgInterfaceDetailPage: FC = observer(() => {
  const { interfaceId } = useParams({
    from: "/_app/wg/interfaces/$interfaceId",
  });

  return <WgInterfaceDetail key={interfaceId} interfaceId={interfaceId} />;
});
