import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { FC } from "react";

import { interfaceTraffic } from "../model/interface-traffic";

interface InterfaceTrafficNoteProps {
  iface: WgInterfaceDto;
}

/**
 * Куда идёт трафик клиентов — строкой: копию выбирает релей точки, без
 * релея копии — только резерв для переноса.
 */
export const InterfaceTrafficNote: FC<InterfaceTrafficNoteProps> = ({
  iface,
}) => {
  const traffic = interfaceTraffic(iface);

  if (!traffic) return null;

  if (traffic.kind === "manual") {
    return (
      <span>
        {traffic.endpointName
          ? `Точка «${traffic.endpointName}» — адрес ноды`
          : "Без точки подключения"}
        : трафик на копию сам не переключится — только резерв для переноса.
      </span>
    );
  }

  return (
    <span>
      Трафик клиентов: релей {traffic.relayName} →{" "}
      <span className="font-medium text-foreground">
        {traffic.servingName ?? "ждёт отчёта релея"}
      </span>{" "}
      · {traffic.pinned ? "закреплено" : "авто"}
    </span>
  );
};
