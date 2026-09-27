import { IMainApi } from "@shared/api";
import { useCollection } from "@shared/lib/holders";
import type { SelectOption } from "@shared/ui";

import { formatInterfaceLabel } from "../lib/format";

interface UseWgInterfaceOptionsOptions {
  /** Только интерфейсы этой ноды; пусто — все. */
  nodeId?: string;
  /** Грузить; каждое включение перечитывает список (например, открытие формы). */
  enabled?: boolean;
  /** Добавить к подписи адрес интерфейса: «wg0 · Альфа (10.8.0.1/24)». */
  withAddress?: boolean;
}

/** Интерфейсы для выпадающих списков: подпись «имя · нода». */
export const useWgInterfaceOptions = ({
  nodeId = "",
  enabled = true,
  withAddress = false,
}: UseWgInterfaceOptionsOptions = {}) => {
  const api = IMainApi.useInstance();

  return useCollection<SelectOption, string>({
    queryFn: async node => {
      const { data, error } = await api.wgInterfaceOptions(
        node ? { nodeId: node } : undefined,
      );

      return {
        data:
          data?.map(iface => ({
            value: iface.id,
            label: withAddress
              ? `${formatInterfaceLabel(iface)} (${iface.addressCidr})`
              : formatInterfaceLabel(iface),
          })) ?? null,
        error,
      };
    },
    keyExtractor: option => option.value,
    watch: [nodeId],
    enabled,
  });
};
