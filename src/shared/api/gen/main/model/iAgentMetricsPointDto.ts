import type { RecordStringAny } from "./recordStringAny.ts";

/**
 * Точка метрик: узел и метрики воркеров из их пульса.
 */
export interface IAgentMetricsPointDto {
  at: number;
  host?: RecordStringAny;
  workers?: RecordStringAny;
}
