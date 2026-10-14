import type { IAgentMetricsPointDto } from "@shared/api/gen/main/model";

/** Сколько держит живой график, мс. */
export const LIVE_METRICS_WINDOW_MS = 5 * 60_000;

/** Больше точек сервер за раз не отдаёт. */
export const METRICS_POINTS_LIMIT = 5000;

/** Период истории метрик. */
export interface IMetricsPeriod {
  value: "1h" | "6h" | "24h";
  label: string;
  windowMinutes: number;
}

export const METRICS_PERIODS: IMetricsPeriod[] = [
  { value: "1h", label: "1 ч", windowMinutes: 60 },
  { value: "6h", label: "6 ч", windowMinutes: 360 },
  { value: "24h", label: "24 ч", windowMinutes: 1440 },
];

/**
 * Точки по возрастанию времени без повторов (история и поток пересекаются),
 * не старше `since`. Досланные без связи вставляются на своё место.
 */
export const mergeMetricsPoints = (
  prev: IAgentMetricsPointDto[],
  add: IAgentMetricsPointDto[],
  since: number,
): IAgentMetricsPointDto[] => {
  const seen = new Set(prev.map(point => point.at));
  const fresh = add.filter(point => {
    if (seen.has(point.at)) return false;
    seen.add(point.at);

    return true;
  });

  return [...prev, ...fresh]
    .filter(point => point.at >= since)
    .sort((a, b) => a.at - b.at);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const numberOr = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const stringOr = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const recordsOf = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

export interface IAgentDisk {
  mount: string;
  usedBytes?: number;
  totalBytes?: number;
}

export interface IAgentInterface {
  name: string;
  rxBps?: number;
  txBps?: number;
  errors?: number;
  drops?: number;
}

export interface IAgentSensor {
  name: string;
  c: number;
}

export interface IAgentGpu {
  index: number;
  name?: string;
  utilPercent?: number;
  memUsedBytes?: number;
  memTotalBytes?: number;
  temperatureC?: number;
}

/**
 * Метрики узла — их собирает сам агент (точка метрик, `host`). Все поля
 * необязательные: нет группы на платформе — нет поля.
 */
export interface IAgentHostMetrics {
  cpuPercent?: number;
  cpuCores: number[];
  load1?: number;
  load5?: number;
  load15?: number;
  memUsedBytes?: number;
  memTotalBytes?: number;
  memAvailableBytes?: number;
  swapUsedBytes?: number;
  swapTotalBytes?: number;
  diskUsedBytes?: number;
  diskTotalBytes?: number;
  disks: IAgentDisk[];
  diskReadBps?: number;
  diskWriteBps?: number;
  netRxBps?: number;
  netTxBps?: number;
  netErrors?: number;
  netDrops?: number;
  interfaces: IAgentInterface[];
  conntrack?: number;
  conntrackMax?: number;
  tcp?: {
    established?: number;
    timeWait?: number;
    closeWait?: number;
    listen?: number;
  };
  processes?: number;
  threads?: number;
  fdsOpen?: number;
  fdsMax?: number;
  uptimeSec?: number;
  temperatureMaxC?: number;
  sensors: IAgentSensor[];
  gpus: IAgentGpu[];
}

const NUMBER_FIELDS = [
  "cpuPercent",
  "load1",
  "load5",
  "load15",
  "memUsedBytes",
  "memTotalBytes",
  "memAvailableBytes",
  "swapUsedBytes",
  "swapTotalBytes",
  "diskUsedBytes",
  "diskTotalBytes",
  "diskReadBps",
  "diskWriteBps",
  "netRxBps",
  "netTxBps",
  "netErrors",
  "netDrops",
  "conntrack",
  "conntrackMax",
  "processes",
  "threads",
  "fdsOpen",
  "fdsMax",
  "uptimeSec",
] as const;

/**
 * Метрики узла из точки: сервер передаёт ответ агента как есть, поэтому
 * значения не того вида пропускаются, а не ломают экран.
 */
export const hostMetrics = (host: unknown): IAgentHostMetrics | undefined => {
  if (!isRecord(host)) return undefined;

  const numbers: Partial<Record<(typeof NUMBER_FIELDS)[number], number>> = {};

  for (const field of NUMBER_FIELDS) {
    const value = numberOr(host[field]);

    if (value !== undefined) numbers[field] = value;
  }

  const tcp = isRecord(host.tcp)
    ? {
        established: numberOr(host.tcp.established),
        timeWait: numberOr(host.tcp.timeWait),
        closeWait: numberOr(host.tcp.closeWait),
        listen: numberOr(host.tcp.listen),
      }
    : undefined;
  const temperatures = isRecord(host.temperatures)
    ? host.temperatures
    : undefined;

  return {
    ...numbers,
    cpuCores: Array.isArray(host.cpuCores)
      ? host.cpuCores.flatMap(core => numberOr(core) ?? [])
      : [],
    disks: recordsOf(host.disks).flatMap(disk => {
      const mount = stringOr(disk.mount);

      return mount
        ? [
            {
              mount,
              usedBytes: numberOr(disk.usedBytes),
              totalBytes: numberOr(disk.totalBytes),
            },
          ]
        : [];
    }),
    interfaces: recordsOf(host.interfaces).flatMap(item => {
      const name = stringOr(item.name);

      return name
        ? [
            {
              name,
              rxBps: numberOr(item.rxBps),
              txBps: numberOr(item.txBps),
              errors: numberOr(item.errors),
              drops: numberOr(item.drops),
            },
          ]
        : [];
    }),
    tcp,
    temperatureMaxC: numberOr(temperatures?.maxC),
    sensors: recordsOf(temperatures?.sensors).flatMap(sensor => {
      const name = stringOr(sensor.name);
      const c = numberOr(sensor.c);

      return name && c !== undefined ? [{ name, c }] : [];
    }),
    gpus: recordsOf(host.gpus).flatMap(gpu => {
      const index = numberOr(gpu.index);

      return index === undefined
        ? []
        : [
            {
              index,
              name: stringOr(gpu.name),
              utilPercent: numberOr(gpu.utilPercent),
              memUsedBytes: numberOr(gpu.memUsedBytes),
              memTotalBytes: numberOr(gpu.memTotalBytes),
              temperatureC: numberOr(gpu.temperatureC),
            },
          ];
    }),
  };
};

/** Метрики узла точки; нет — `undefined`. */
export const pointHost = (
  point: IAgentMetricsPointDto | undefined,
): IAgentHostMetrics | undefined => hostMetrics(point?.host);

/** Точка графика узла: время и разобранные метрики. */
export interface IHostPoint {
  at: number;
  host: IAgentHostMetrics | undefined;
}

/** Точки для графиков узла: метрики разбираются один раз. */
export const hostPoints = (points: IAgentMetricsPointDto[]): IHostPoint[] =>
  points.map(point => ({ at: point.at, host: pointHost(point) }));

/** Есть ли поле узла хотя бы в одной точке: графики — только для присланного. */
export const hasHostMetric = (
  points: IHostPoint[],
  pick: (host: IAgentHostMetrics) => number | undefined,
): boolean =>
  points.some(point => !!point.host && pick(point.host) !== undefined);

/** Ответ `GET /metrics` воркера в точке; нет — `undefined`. */
export const workerMetrics = (
  point: IAgentMetricsPointDto | undefined,
  worker: string,
): unknown => point?.workers?.[worker];

/** Поле-момент времени (`at`, `startedAt`): как показатель бессмысленно. */
const isTimeField = (key: string): boolean => key === "at" || /At$/.test(key);

/** Показатель: число, строка (адрес, устройство, текст ошибки) или да/нет. */
export type TMetricValue = number | string | boolean;

/** Строка длиннее — не показатель (смотреть в ответе целиком). */
const MAX_METRIC_TEXT = 200;

const metricValue = (field: unknown): TMetricValue | undefined => {
  if (typeof field === "number")
    return Number.isFinite(field) ? field : undefined;
  if (typeof field === "boolean") return field;
  if (typeof field === "string" && field && field.length <= MAX_METRIC_TEXT) {
    return field;
  }

  return undefined;
};

/**
 * Поля-показатели значения (вложенные — через точку): сначала строки и да/нет
 * (что это и как настроено), затем числа; моменты времени пропускаются.
 */
export const metricFields = (value: unknown): string[] => {
  const collect = (node: unknown, prefix: string, depth: number): string[] => {
    if (!isRecord(node) || depth > 2) return [];

    return Object.entries(node).flatMap(([key, field]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (metricValue(field) !== undefined) {
        return isTimeField(key) && typeof field === "number" ? [] : [path];
      }

      return collect(field, path, depth + 1);
    });
  };
  const fields = collect(value, "", 0);
  const isNumber = (path: string) =>
    typeof readMetric(value, path) === "number";

  return [
    ...fields.filter(path => !isNumber(path)).sort(),
    ...fields.filter(isNumber).sort(),
  ];
};

/** Показатель по пути «a.b.c»; не показатель — `undefined`. */
export const readMetric = (
  value: unknown,
  path: string,
): TMetricValue | undefined => {
  let current: unknown = value;

  for (const key of path.split(".")) {
    current = isRecord(current) ? current[key] : undefined;
  }

  return metricValue(current);
};
