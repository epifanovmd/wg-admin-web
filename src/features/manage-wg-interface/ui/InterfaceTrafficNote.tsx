import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

import { interfaceTraffic } from "../model/interface-traffic";

interface InterfaceTrafficNoteProps {
  iface: WgInterfaceDto;
}

/**
 * Куда идёт трафик клиентов: копию выбирает релей точки (управление — на
 * странице пробросов), без релея копии — только резерв для переноса.
 */
export const InterfaceTrafficNote: FC<InterfaceTrafficNoteProps> = ({
  iface,
}) => {
  const traffic = interfaceTraffic(iface);

  if (!traffic) return null;

  if (traffic.kind === "manual") {
    return (
      <p className="text-xs text-muted-foreground">
        Копии — резерв для ручного переноса:{" "}
        {traffic.endpointName
          ? `точка «${traffic.endpointName}» — адрес ноды`
          : "у интерфейса нет точки подключения"}
        , трафик на копию сам не переключится. Для переключения нужна точка
        через релей панели.
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      Трафик клиентов: релей {traffic.relayName} →{" "}
      <span className="text-foreground">
        {traffic.servingName ?? "ждёт отчёта релея"}
      </span>{" "}
      · {traffic.pinned ? "закреплено" : "авто"}.{" "}
      <Link to="/wg/forwards" className="underline hover:text-foreground">
        Управление — в пробросах
      </Link>
    </p>
  );
};
