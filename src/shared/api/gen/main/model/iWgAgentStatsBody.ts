import type { IWgAgentStatsBodyForwardsItem } from "./iWgAgentStatsBodyForwardsItem.ts";
import type { IWgAgentStatsBodyInterfacesItem } from "./iWgAgentStatsBodyInterfacesItem.ts";
import type { IWgAgentStatsBodySocksItem } from "./iWgAgentStatsBodySocksItem.ts";
import type { IWgNodeProbe } from "./iWgNodeProbe.ts";
import type { IWgNodeSysMetrics } from "./iWgNodeSysMetrics.ts";
import type { IWgTunnelProbe } from "./iWgTunnelProbe.ts";

/**
 * Статистика от агента (см. wg-stats). Поля тика необязательны: без них
 * момент сбора — время приёма, повторы не распознаются.
 */
export interface IWgAgentStatsBody {
  /** Номер тика в рамках запуска агента: повтор с тем же номером отбрасывается. */
  seq?: number;
  /** Идентификатор запуска агента: при перезапуске нумерация начинается заново. */
  bootId?: string;
  /** Момент сбора по часам агента (unix ms). */
  collectedAt?: number;
  /** Момент отправки по часам агента (unix ms): задержка доставки — `sentAt − collectedAt`. */
  sentAt?: number;
  sys?: IWgNodeSysMetrics;
  /** Пробы IPIP-туннелей ноды. */
  tunnels?: IWgTunnelProbe[];
  /** Активные маршруты пробросов релея. */
  forwards?: IWgAgentStatsBodyForwardsItem[];
  /** Подключения и трафик прокси ноды. */
  socks?: IWgAgentStatsBodySocksItem[];
  /** Пробы других нод (раз в ~60 с). */
  nodeProbes?: IWgNodeProbe[];
  interfaces: IWgAgentStatsBodyInterfacesItem[];
}
