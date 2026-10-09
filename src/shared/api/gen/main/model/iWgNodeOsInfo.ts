import type { EWgMode } from "./eWgMode.ts";

/**
 * Сведения об ОС ноды: от агента (узел) и воркера wg (режим, порты).
 */
export interface IWgNodeOsInfo {
  platform?: string;
  release?: string;
  distro?: string;
  arch?: string;
  hostname?: string;
  kernel?: string;
  /** Реализация WireGuard: модуль ядра или wireguard-go. */
  wgMode?: EWgMode;
  /** Занятые UDP-порты хоста. */
  udpPorts?: number[];
  /** Слушающие TCP-порты хоста. */
  tcpPorts?: number[];
}
