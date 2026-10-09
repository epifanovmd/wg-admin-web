import type { WgNodeAgentActions } from "@features/manage-wg-node";
import type { AgentDto, IAgentReleaseDto } from "@shared/api/gen/main/model";

/** Что можно делать с агентом ноды: права ноды считает страница. */
export interface IWgNodeAgentAccess {
  /** Обновление агента, перезапуск и обновление воркеров (`wg:node:agent`). */
  canManage: boolean;
  /** Журнал агента и воркеров с узла (`wg:node:logs`). */
  canLogs: boolean;
}

/** Агент ноды и всё, что нужно его вкладкам; собирает страница. */
export interface IWgNodeAgentContext {
  nodeId: string;
  agent: AgentDto;
  /** Выпуск агента: кого можно обновить; нет права или каталога — `null`. */
  release: IAgentReleaseDto | null;
  actions: WgNodeAgentActions;
  access: IWgNodeAgentAccess;
}
