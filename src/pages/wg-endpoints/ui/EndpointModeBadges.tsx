import type {
  EWgEndpointRoute,
  WgEndpointDto,
} from "@shared/api/gen/main/model";
import { Badge, Tooltip } from "@shared/ui";

const ROUTE_LABEL: Record<EWgEndpointRoute, string> = {
  auto: "авто",
  tunnel: "только туннель",
  direct: "напрямую",
};

/** Режим точки: адрес ноды или релей с пересылкой и маршрутом. */
export const EndpointModeBadges = ({
  endpoint,
  relayName,
}: {
  endpoint: WgEndpointDto;
  relayName: string | null;
}) =>
  endpoint.mode === "direct" ? (
    <Tooltip content="Панель трафик не пересылает: хост должен вести прямо на ноду интерфейса">
      <Badge variant="outline">адрес ноды</Badge>
    </Tooltip>
  ) : (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="info">релей: {relayName ?? "—"}</Badge>
      <Badge variant={endpoint.forwardMode === "ipip" ? "purple" : "muted"}>
        {endpoint.forwardMode === "ipip"
          ? `IPIP · ${ROUTE_LABEL[endpoint.route]}`
          : "DNAT"}
      </Badge>
    </div>
  );
