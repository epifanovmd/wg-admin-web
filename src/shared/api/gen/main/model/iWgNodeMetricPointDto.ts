/**
 * Метрики ноды за период (агрегированные по шагу).
 */
export interface IWgNodeMetricPointDto {
  ts: string;
  cpuPercent: number;
  load1: number;
  memUsedBytes: number;
  memTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  uptimeSec: number;
}
