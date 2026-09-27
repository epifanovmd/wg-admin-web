import type { EWgMode } from "./eWgMode.ts";

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
