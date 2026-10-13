import {
  AGENT_PERMISSIONS,
  IAgentsStore,
  isAgentLive,
  useAgentsRealtime,
} from "@entities/agent";
import { IUserStore } from "@entities/user";
import { useEnrollAgentVM } from "@features/enroll-agent";
import { useAgentActions } from "@features/manage-agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { useEffect } from "react";

/** Действия над агентом в строке таблицы. */
export interface IAgentRowAccess {
  /** Новая версия, до которой можно обновить; нельзя — `null`. */
  updateTo: string | null;
  canRotate: boolean;
  canRevoke: boolean;
  canDelete: boolean;
}

/**
 * Список агентов с их проблемами и сборками для обновления; действия с
 * агентом и установка нового. Данные и комната `agents` — только с правом
 * просмотра.
 */
export const useAgentsVM = () => {
  const store = IAgentsStore.useInstance();
  const userStore = IUserStore.useInstance();
  const canView = userStore.can(AGENT_PERMISSIONS.VIEW);
  const canManage = userStore.can(AGENT_PERMISSIONS.MANAGE);
  const canEnroll = userStore.can(AGENT_PERMISSIONS.ENROLL);

  useEffect(() => {
    if (!canView) return;
    void store.load();
    void store.loadRelease();
  }, [canView, store]);
  useAgentsRealtime(canView);

  const actions = useAgentActions();
  const install = useEnrollAgentVM();

  useCloseWhenForbidden(install.open, canEnroll, () => install.setOpen(false));

  const accessOf = (agent: AgentDto): IAgentRowAccess => {
    const candidate = store.updateCandidate(agent.id);
    const live = canManage && isAgentLive(agent);

    return {
      updateTo: live && candidate ? candidate.target : null,
      canRotate: live,
      canRevoke: canManage && !agent.revoked,
      canDelete: canManage,
    };
  };

  return {
    agents: store.agents,
    isLoading: store.isLoading,
    error: store.error,
    alerts: store.alerts,
    /** Новая версия, если агента можно обновить. */
    updateTarget: (agent: AgentDto) =>
      store.updateCandidate(agent.id)?.target ?? null,
    accessOf,
    /** Меняется вместе с правами — колонки таблицы пересобираются по нему. */
    accessKey: userStore.accessKey,
    /** Сборки и кандидаты на обновление: пришли или сменились — колонки тоже пересобираются. */
    release: store.release,
    actions,
    install,
    canEnroll,
  };
};

export type AgentsVM = ReturnType<typeof useAgentsVM>;
