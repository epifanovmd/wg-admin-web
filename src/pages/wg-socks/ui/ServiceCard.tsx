import { formatTraffic, WgRxTx, WgToggleSwitch } from "@entities/wg";
import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { Badge, Card, IconButton, Tooltip } from "@shared/ui";
import { Pencil, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { socksClientAddress } from "../model/socks-links";
import type { WgSocksVM } from "../model/useWgSocksVM";
import { ServiceClients } from "./ServiceClients";
import { ServiceUsers } from "./ServiceUsers";

interface ServiceCardProps {
  vm: WgSocksVM;
  service: WgSocksServiceDto;
}

/** Карточка прокси: адреса, статистика, пользователи и устройства. */
export const ServiceCard: FC<ServiceCardProps> = observer(({ vm, service }) => (
  <Card
    title={
      <span className="flex items-center gap-2">
        {service.name}
        {!service.enabled && <Badge variant="muted">выключен</Badge>}
      </span>
    }
    description={
      <span className="font-mono text-xs">
        {service.nodeName ?? "нода"} :{service.listenPort}
        {(service.clientHost || service.clientPort) &&
          ` · клиенты → ${socksClientAddress(service)}`}
      </span>
    }
    extra={
      vm.canManage && (
        <>
          <WgToggleSwitch
            enabled={service.enabled}
            onToggle={() => vm.toggle(service)}
          />
          <Tooltip content="Изменить">
            <IconButton
              aria-label="Изменить"
              onClick={() => vm.form.openEdit(service)}
            >
              <Pencil size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Удалить">
            <IconButton
              aria-label="Удалить"
              variant="destructive"
              onClick={() => void vm.remove(service)}
            >
              <Trash2 size={15} />
            </IconButton>
          </Tooltip>
        </>
      )
    }
    contentClassName="flex flex-col gap-4"
  >
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
      <span>
        Подключение:{" "}
        <span className="font-mono text-foreground">
          {socksClientAddress(service)}
        </span>
      </span>
      <span>
        Сертификат сервера:{" "}
        <span className="font-mono text-foreground">{service.serverName}</span>
      </span>
      {service.live ? (
        <span>
          Сейчас: {service.live.connections} соед. ·{" "}
          <WgRxTx
            inline
            rx={formatTraffic(service.live.rxBytes)}
            tx={formatTraffic(service.live.txBytes)}
          />
        </span>
      ) : (
        <span>Агент ещё не прислал статистику</span>
      )}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ServiceUsers vm={vm} service={service} />
      <ServiceClients vm={vm} service={service} />
    </div>
  </Card>
));
