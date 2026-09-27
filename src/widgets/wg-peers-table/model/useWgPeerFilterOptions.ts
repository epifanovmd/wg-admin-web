import { useWgInterfaceOptions, useWgNodeOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { useCollection } from "@shared/lib/holders";
import type { SelectOption } from "@shared/ui";

interface UseWgPeerFilterOptions {
  /** Интерфейсы — только этой ноды; пусто — все. */
  nodeId?: string;
  /** Показывать выбор ноды и интерфейса (нет — на странице интерфейса). */
  withLocation: boolean;
  /** Показывать выбор держателя (только у видящих всех пиров). */
  withOwner: boolean;
}

/** Варианты фильтров списка пиров: ноды, интерфейсы, держатели. */
export const useWgPeerFilterOptions = ({
  nodeId,
  withLocation,
  withOwner,
}: UseWgPeerFilterOptions) => {
  const api = IMainApi.useInstance();
  const nodes = useWgNodeOptions({ enabled: withLocation });
  const interfaces = useWgInterfaceOptions({ nodeId, enabled: withLocation });

  const owners = useCollection<SelectOption>({
    queryFn: async () => {
      const { data, error } = await api.getUserOptions();

      return {
        data:
          data?.data.map(user => ({
            value: user.id,
            label: user.name ?? user.id.slice(0, 8),
          })) ?? null,
        error,
      };
    },
    keyExtractor: option => option.value,
    autoLoad: true,
    enabled: withOwner,
  });

  return {
    nodes: nodes.items,
    interfaces: interfaces.items,
    owners: owners.items,
  };
};
