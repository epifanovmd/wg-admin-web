import { IUserStore } from "@entities/user";
import {
  useWgInterfaceOptions,
  useWgNodeOptions,
  WG_PERMISSIONS,
} from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { IWgSeriesDto } from "@shared/api/gen/main/model";
import { useCollection, useEntity } from "@shared/lib/holders";
import type { SelectOption } from "@shared/ui";
import { useMemo, useState } from "react";

export const STATS_PRESETS = [
  { value: "1h", label: "1 час", ms: 3600_000 },
  { value: "6h", label: "6 часов", ms: 6 * 3600_000 },
  { value: "24h", label: "Сутки", ms: 24 * 3600_000 },
  { value: "7d", label: "Неделя", ms: 7 * 24 * 3600_000 },
  { value: "30d", label: "Месяц", ms: 30 * 24 * 3600_000 },
] as const;

export type TStatsPreset = (typeof STATS_PRESETS)[number]["value"];
export type TStatsGroupBy = "total" | "node" | "interface" | "peer";

/** Точка графиков: скорость и трафик выборки за bucket. */
export interface IStatsChartRow {
  ts: number;
  rxBps: number;
  txBps: number;
  rxBytes: number;
  txBytes: number;
}

/** Серии разбивки → точки графиков: значения групп в bucket складываются. */
export const sumStatsSeries = (series: IWgSeriesDto[]): IStatsChartRow[] => {
  const rows = new Map<number, IStatsChartRow>();

  for (const line of series) {
    for (const point of line.points) {
      const ts = new Date(point.ts).getTime();
      const row = rows.get(ts) ?? {
        ts,
        rxBps: 0,
        txBps: 0,
        rxBytes: 0,
        txBytes: 0,
      };

      row.rxBps += point.rxBps;
      row.txBps += point.txBps;
      row.rxBytes += point.rxBytes;
      row.txBytes += point.txBytes;
      rows.set(ts, row);
    }
  }

  return [...rows.values()].sort((a, b) => a.ts - b.ts);
};

/**
 * Статистика: фильтры, графики скорости и трафика выборки (приём и отдача),
 * итоги с разбивкой по нодам, интерфейсам или пирам.
 */
export const useWgStatsVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const canView = userStore.can(WG_PERMISSIONS.STATS_VIEW);
  const [preset, setPreset] = useState<TStatsPreset>("24h");
  const [groupBy, setGroupBy] = useState<TStatsGroupBy>("total");
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [interfaceId, setInterfaceId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);

  // Холдер создаётся один раз: параметры приходят аргументом из watch.
  const params = JSON.stringify({
    preset,
    groupBy,
    nodeId,
    interfaceId,
    peerId,
  });

  const series = useEntity<IWgSeriesDto[], string>({
    queryFn: async rawParams => {
      const current = JSON.parse(rawParams) as {
        preset: TStatsPreset;
        groupBy: TStatsGroupBy;
        nodeId: string | null;
        interfaceId: string | null;
        peerId: string | null;
      };
      const presetConfig = STATS_PRESETS.find(
        item => item.value === current.preset,
      )!;

      return api.wgStatsSeries({
        from: new Date(Date.now() - presetConfig.ms).toISOString(),
        to: new Date().toISOString(),
        groupBy: current.groupBy,
        nodeId: current.nodeId ?? undefined,
        interfaceId: current.interfaceId ?? undefined,
        peerId: current.peerId ?? undefined,
      });
    },
    watch: [params],
    enabled: canView,
  });

  // Фильтры по сущностям — при праве видеть их списки.
  const nodeOptions = useWgNodeOptions({
    enabled: canView && userStore.can(WG_PERMISSIONS.NODE_VIEW),
  });
  const interfaceOptions = useWgInterfaceOptions({
    enabled: canView && userStore.can(WG_PERMISSIONS.INTERFACE_VIEW),
  });
  const peerOptions = useCollection<SelectOption>({
    queryFn: async () => {
      const { data, error } = await api.wgPeerOptions();

      return {
        data: data?.map(peer => ({ value: peer.id, label: peer.name })) ?? null,
        error,
      };
    },
    autoLoad: true,
    enabled: canView,
  });

  const labelOf = useMemo(() => {
    const maps: Record<string, Map<string, string>> = {
      node: new Map(
        nodeOptions.items.map(option => [
          String(option.value),
          String(option.label),
        ]),
      ),
      interface: new Map(
        interfaceOptions.items.map(option => [
          String(option.value),
          String(option.label),
        ]),
      ),
      peer: new Map(
        peerOptions.items.map(option => [
          String(option.value),
          String(option.label),
        ]),
      ),
    };

    return (key: string): string => {
      if (key === "total") return "Всего";

      return maps[groupBy]?.get(key) ?? key.slice(0, 8);
    };
  }, [groupBy, nodeOptions.items, interfaceOptions.items, peerOptions.items]);

  const chart = useMemo(() => sumStatsSeries(series.data ?? []), [series.data]);

  const summary = useMemo(
    () =>
      (series.data ?? []).map(line => ({
        key: line.key,
        label: labelOf(line.key),
        rxBytes: line.points.reduce((sum, point) => sum + point.rxBytes, 0),
        txBytes: line.points.reduce((sum, point) => sum + point.txBytes, 0),
        rxPeakBps: Math.max(0, ...line.points.map(point => point.rxPeakBps)),
        txPeakBps: Math.max(0, ...line.points.map(point => point.txPeakBps)),
      })),
    [series.data, labelOf],
  );

  return {
    preset,
    setPreset,
    groupBy,
    setGroupBy,
    nodeId,
    setNodeId,
    interfaceId,
    setInterfaceId,
    peerId,
    setPeerId,
    nodeOptions: nodeOptions.items,
    interfaceOptions: interfaceOptions.items,
    peerOptions: peerOptions.items,
    isLoading: series.isLoading,
    chart,
    summary,
    labelOf,
  };
};
