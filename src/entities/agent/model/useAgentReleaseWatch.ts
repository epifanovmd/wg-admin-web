import { reaction } from "mobx";
import { useEffect, useRef } from "react";

import { IAgentsStore, type IAgentUpdateCandidate } from "./types";
import { useAgentsRealtime } from "./useAgentsRealtime";

interface IAgentReleaseWatchHandlers {
  /** Агент или воркер получил новую версию за время сессии. */
  onUpdateAvailable?: (candidate: IAgentUpdateCandidate) => void;
}

const keyOf = (c: IAgentUpdateCandidate) =>
  `${c.agentId}/${c.worker ?? ""}@${c.target}`;

/**
 * Новые версии на всё время сессии: агент сам находит новую версию в своём
 * каталоге сборок, сборки воркеров раздаёт сервер — всё приходит в
 * `agent:updated` (`updateAvailable`). Уже известные при открытии — без
 * `onUpdateAvailable`: их видно по значку.
 */
export const useAgentReleaseWatch = (
  enabled: boolean,
  { onUpdateAvailable }: IAgentReleaseWatchHandlers = {},
): void => {
  const store = IAgentsStore.useInstance();
  const notify = useRef(onUpdateAvailable);

  notify.current = onUpdateAvailable;

  useAgentsRealtime(enabled);
  useEffect(() => {
    if (!enabled) return undefined;
    void store.load();
    void store.loadRelease();
    let known: Set<string> | null = null;

    return reaction(
      () => (store.isLoading ? null : store.candidates),
      candidates => {
        if (!candidates) return;
        const found = new Map(candidates.map(c => [keyOf(c), c]));

        if (known) {
          for (const [key, candidate] of found) {
            if (!known.has(key)) notify.current?.(candidate);
          }
        }
        known = new Set(found.keys());
      },
      { fireImmediately: true },
    );
  }, [enabled, store]);
};
