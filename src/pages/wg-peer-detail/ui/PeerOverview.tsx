import {
  byteAxisDomain,
  formatAxisTime,
  formatBps,
  formatChartMoment,
  formatHandshakeAgo,
  formatTraffic,
  WgRxTx,
  WgSpeedChart,
} from "@entities/wg";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import { AreaChart, Card, CopyableText, InfoField, StatCard } from "@shared/ui";
import { CalendarClock, Database, Gauge, Handshake } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgPeerDetailVM } from "../model/useWgPeerDetailVM";

interface PeerOverviewProps {
  vm: WgPeerDetailVM;
  peer: WgPeerDto;
}

/** Показатели пира: скорость, трафик, handshake, графики и параметры. */
export const PeerOverview: FC<PeerOverviewProps> = observer(({ vm, peer }) => (
  <>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Скорость"
        value={
          vm.live ? (
            <WgRxTx
              rx={formatBps(vm.live.rxBps)}
              tx={formatBps(vm.live.txBps)}
            />
          ) : (
            "—"
          )
        }
        icon={<Gauge size={18} />}
      />
      <StatCard
        title="Трафик"
        value={formatTraffic(peer.rxBytesTotal + peer.txBytesTotal)}
        description={
          <WgRxTx
            inline
            rx={formatTraffic(peer.rxBytesTotal)}
            tx={formatTraffic(peer.txBytesTotal)}
          />
        }
        icon={<Database size={18} />}
      />
      <StatCard
        title="Handshake"
        value={formatHandshakeAgo(
          vm.live?.lastHandshakeAt ?? peer.lastHandshakeAt,
        )}
        description={vm.live?.endpoint ?? peer.lastEndpoint ?? undefined}
        icon={<Handshake size={18} />}
      />
      <StatCard
        title="Срок действия"
        value={
          peer.expiresAt
            ? formatter.date.formatDate(peer.expiresAt)
            : "бессрочно"
        }
        description={peer.disabledReason === "expired" ? "истёк" : undefined}
        icon={<CalendarClock size={18} />}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Скорость (live)">
        <WgSpeedChart points={vm.speedPoints} />
      </Card>
      <Card title="Трафик за сутки">
        <AreaChart
          data={vm.historyPoints}
          x={point => new Date(point.ts)}
          xScale="time"
          series={[
            { key: "rx", label: "Приём", value: point => point.rxBytes },
            { key: "tx", label: "Отдача", value: point => point.txBytes },
          ]}
          height={220}
          stacked
          grid="y"
          legend="top"
          formatValue={formatTraffic}
          formatX={formatChartMoment}
          xAxis={{ tickFormat: value => formatAxisTime(value) }}
          yAxis={{
            tickFormat: formatTraffic,
            tickCount: 4,
            domain: byteAxisDomain(
              vm.historyPoints.map(point => point.rxBytes + point.txBytes),
            ),
          }}
          loading={vm.isHistoryLoading}
          emptyText="Истории пока нет"
          ariaLabel="Трафик пира за сутки"
        />
      </Card>
    </div>

    <Card title="Параметры">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField label="Адрес IPv4" value={peer.addressV4} />
        <InfoField label="Адрес IPv6" value={peer.addressV6 ?? "—"} />
        <InfoField label="AllowedIPs клиента" value={peer.clientAllowedIPs} />
        <InfoField
          label="DNS клиента"
          value={peer.clientDns ?? "как у интерфейса"}
        />
        <InfoField label="Keepalive" value={`${peer.persistentKeepalive} с`} />
        <InfoField
          label="PSK"
          value={peer.hasPresharedKey ? "включён" : "нет"}
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <InfoField
            label="Публичный ключ"
            value={
              <CopyableText
                text={peer.publicKey}
                className="break-all font-mono text-xs"
              />
            }
          />
        </div>
        {peer.description && (
          <div className="sm:col-span-2 lg:col-span-3">
            <InfoField label="Описание" value={peer.description} />
          </div>
        )}
      </div>
    </Card>
  </>
));
