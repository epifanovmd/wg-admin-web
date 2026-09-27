import type { IWgAgentCommand } from "./iWgAgentCommand.ts";
import type { IWgAgentDesiredStateSettings } from "./iWgAgentDesiredStateSettings.ts";
import type { IWgAgentForward } from "./iWgAgentForward.ts";
import type { IWgAgentInterface } from "./iWgAgentInterface.ts";
import type { IWgAgentTunnel } from "./iWgAgentTunnel.ts";
import type { IWgProbeTarget } from "./iWgProbeTarget.ts";
import type { IWgSocksAgentConfig } from "./iWgSocksAgentConfig.ts";

/**
 * Полное желаемое состояние ноды.
 */
export interface IWgAgentDesiredState {
  version: number;
  nodeId: string;
  nodeName: string;
  interfaces: IWgAgentInterface[];
  tunnels: IWgAgentTunnel[];
  forwards: IWgAgentForward[];
  /** Ноды для проверки связности (не версионируются: берутся из любого ответа). */
  probeTargets: IWgProbeTarget[];
  /** SOCKS5-прокси через mTLS на ноде. */
  socks: IWgSocksAgentConfig[];
  commands: IWgAgentCommand[];
  settings: IWgAgentDesiredStateSettings;
}
