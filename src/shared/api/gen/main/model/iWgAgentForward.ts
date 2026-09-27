import type { EWgForwardRoute } from "./eWgForwardRoute.ts";
import type { IWgAgentForwardCandidatesItem } from "./iWgAgentForwardCandidatesItem.ts";
import type { IWgAgentForwardProto } from "./iWgAgentForwardProto.ts";

/**
 * Проброс на релее (см. агент: failover.ts).
 */
export interface IWgAgentForward {
  /** id проброса wg-forward — для отчёта о маршруте; у точек подключения нет. */
  id?: string;
  proto: IWgAgentForwardProto;
  listenPort: number;
  targetIp: string;
  targetPort: number;
  /**
   * Прямой адрес цели для аварийного пути мимо туннеля.
   * @nullable
   */
  fallbackIp?: string | null;
  route?: EWgForwardRoute;
  /**
   * Туннель, по здоровью которого агент выбирает маршрут.
   * @nullable
   */
  tunnel?: string | null;
  /** Копии интерфейса (реплики) по приоритету — агент берёт первую живую. */
  candidates?: IWgAgentForwardCandidatesItem[];
}
