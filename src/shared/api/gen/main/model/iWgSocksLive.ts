/**
 * Live-показатели прокси по отчёту агента.
 */
export interface IWgSocksLive {
  connections: number;
  rxBytes: number;
  txBytes: number;
  ts: string;
}
