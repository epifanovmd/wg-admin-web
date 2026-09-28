import { formatBps, formatTraffic, WgRxTx, WgSpeedChart } from "@entities/wg";
import {
  InterfaceReplicasCell,
  InterfaceTrafficNote,
} from "@features/manage-wg-interface";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Button, Card, CopyableText, InfoField, StatCard } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { Copy, Database, Gauge, Users } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgInterfaceDetailVM } from "../model/useWgInterfaceDetailVM";

interface InterfaceSectionProps {
  vm: WgInterfaceDetailVM;
  iface: WgInterfaceDto;
}

/** Обзор интерфейса: live-показатели, скорость, параметры и копии. */
export const InterfaceOverviewTab: FC<InterfaceSectionProps> = observer(
  ({ vm, iface }) => {
    const { live } = vm;

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            title="Скорость"
            value={
              live ? (
                <WgRxTx rx={formatBps(live.rxBps)} tx={formatBps(live.txBps)} />
              ) : (
                "—"
              )
            }
            icon={<Gauge size={18} />}
          />
          <StatCard
            title="Трафик"
            value={live ? formatTraffic(live.rxTotal + live.txTotal) : "—"}
            description={
              live ? (
                <WgRxTx
                  inline
                  rx={formatTraffic(live.rxTotal)}
                  tx={formatTraffic(live.txTotal)}
                />
              ) : undefined
            }
            icon={<Database size={18} />}
          />
          <StatCard
            title="Пиры онлайн"
            value={live ? `${live.peersOnline} / ${live.peersTotal}` : "—"}
            icon={<Users size={18} />}
          />
        </div>
        <Card title="Скорость">
          <WgSpeedChart points={vm.speedPoints} />
        </Card>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Параметры" contentClassName="grid grid-cols-2 gap-3">
            <InfoField label="Адрес" value={iface.addressCidr} />
            <InfoField label="IPv6" value={iface.addressV6Cidr} emptyText="—" />
            <InfoField label="Порт" value={String(iface.listenPort)} />
            <InfoField label="DNS" value={iface.dns} emptyText="—" />
            <InfoField
              label="MTU"
              value={iface.mtu ? String(iface.mtu) : null}
              emptyText="авто"
            />
            <InfoField
              label="NAT"
              value={iface.natEnabled ? "включён" : "выключен"}
            />
          </Card>
          <Card
            title="Подключение клиентов"
            contentClassName="flex flex-col gap-3"
          >
            <InfoField
              label="Endpoint в конфигах"
              value={iface.clientEndpoint}
              emptyText="не определён — задайте точку подключения или publicHost ноды"
            />
            <InfoField
              label="Точка подключения"
              value={
                iface.endpoint
                  ? iface.endpoint.mode === "relay"
                    ? `${iface.endpoint.name} · через релей ${iface.endpoint.relayNodeName ?? "—"}`
                    : `${iface.endpoint.name} · адрес ноды`
                  : "нет (адрес ноды)"
              }
            />
            <InfoField
              label="Публичный ключ"
              value={<CopyableText text={iface.publicKey} truncate />}
            />
          </Card>
        </div>
        <Card
          title="Копии на нодах"
          description={<InterfaceTrafficNote iface={iface} />}
          extra={
            iface.endpoint?.mode === "relay" && iface.replicas.length > 0 ? (
              <Button asChild size="sm" variant="ghost">
                <Link to="/wg/forwards">Управление трафиком</Link>
              </Button>
            ) : undefined
          }
        >
          {iface.replicas.length > 0 ? (
            <InterfaceReplicasCell
              iface={iface}
              canManageReplicas={vm.permissions.canReplicas}
              onRemoveReplica={(target, nodeId) =>
                void vm.actions.removeReplica(target, nodeId)
              }
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Копий нет — интерфейс работает только на «
                {iface.nodeName ?? "—"}».{" "}
                {iface.endpoint?.mode === "relay"
                  ? "Копия на другой ноде станет резервом: при её отказе релей переключит трафик."
                  : "Копия на другой ноде — готовый резерв для переноса."}
              </p>
              {vm.permissions.canReplicas && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Copy size={14} />}
                  onClick={() => vm.move.openFor(iface, "copy")}
                >
                  Сделать копию
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  },
);
