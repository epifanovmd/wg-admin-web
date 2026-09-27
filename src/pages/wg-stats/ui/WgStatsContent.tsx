import { formatBps, formatTraffic } from "@entities/wg";
import { Card, createColumnHelper, Segmented, Select, Table } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { STATS_PRESETS, useWgStatsVM } from "../model/useWgStatsVM";
import { WgStatsChart } from "./WgStatsChart";

type StatsVM = ReturnType<typeof useWgStatsVM>;
type SummaryRow = StatsVM["summary"][number];

const column = createColumnHelper<SummaryRow>();

const summaryColumns = [
  column.accessor("label", { header: "Серия" }),
  column.accessor("rxBytes", {
    header: "Приём",
    size: 130,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{formatTraffic(getValue())}</span>
    ),
  }),
  column.accessor("txBytes", {
    header: "Отдача",
    size: 130,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{formatTraffic(getValue())}</span>
    ),
  }),
  column.accessor("rxPeakBps", {
    header: "Пик приёма",
    size: 140,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{formatBps(getValue())}</span>
    ),
  }),
  column.accessor("txPeakBps", {
    header: "Пик отдачи",
    size: 140,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{formatBps(getValue())}</span>
    ),
  }),
];

export const WgStatsContent: FC = observer(() => {
  const vm = useWgStatsVM();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Segmented
          value={vm.preset}
          onValueChange={vm.setPreset}
          options={STATS_PRESETS.map(({ value, label }) => ({ value, label }))}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Select
          value={vm.nodeId}
          onChange={vm.setNodeId}
          options={vm.nodeOptions}
          placeholder="Все ноды"
          clearable
          className="w-full sm:w-56"
        />
        <Select
          value={vm.interfaceId}
          onChange={vm.setInterfaceId}
          options={vm.interfaceOptions}
          placeholder="Все интерфейсы"
          clearable
          className="w-full sm:w-56"
        />
        <Select
          value={vm.peerId}
          onChange={vm.setPeerId}
          options={vm.peerOptions}
          placeholder="Все пиры"
          clearable
          className="w-full sm:w-56"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Скорость" description="Средняя за интервал графика">
          <WgStatsChart
            rows={vm.chart}
            rx={row => row.rxBps}
            tx={row => row.txBps}
            format={formatBps}
            loading={vm.isLoading}
            ariaLabel="Скорость трафика"
          />
        </Card>
        <Card title="Трафик" description="Объём за интервал графика">
          <WgStatsChart
            rows={vm.chart}
            rx={row => row.rxBytes}
            tx={row => row.txBytes}
            format={formatTraffic}
            loading={vm.isLoading}
            ariaLabel="Объём трафика"
          />
        </Card>
      </div>

      <Card title="Итоги за период" contentClassName="flex flex-col gap-3">
        <Segmented
          value={vm.groupBy}
          onValueChange={vm.setGroupBy}
          options={[
            { value: "total", label: "Всего" },
            { value: "node", label: "По нодам" },
            { value: "interface", label: "По интерфейсам" },
            { value: "peer", label: "По пирам" },
          ]}
          className="self-start"
        />
        <Table
          className="w-full flex-none"
          data={vm.summary}
          columns={summaryColumns}
          loading={vm.isLoading}
          labels={{ empty: "Нет данных за выбранный период" }}
          getRowId={row => row.key}
          aria-label="Итоги статистики"
        />
      </Card>
    </div>
  );
});
