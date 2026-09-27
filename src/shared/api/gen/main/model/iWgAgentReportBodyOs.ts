import type { EWgMode } from "./eWgMode.ts";

export type IWgAgentReportBodyOs = {
  tcpPorts?: number[];
  udpPorts?: number[];
  wgMode?: EWgMode;
  kernel?: string;
  hostname?: string;
  arch?: string;
  distro?: string;
  release?: string;
  platform?: string;
};
