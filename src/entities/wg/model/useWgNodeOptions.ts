import { IMainApi } from "@shared/api";
import { useCollection } from "@shared/lib/holders";
import type { SelectOption } from "@shared/ui";

interface UseWgNodeOptionsOptions {
  /** Грузить; каждое включение перечитывает список (например, открытие формы). */
  enabled?: boolean;
}

/** Ноды для выпадающих списков: значение — id, подпись — имя. */
export const useWgNodeOptions = ({
  enabled = true,
}: UseWgNodeOptionsOptions = {}) => {
  const api = IMainApi.useInstance();

  return useCollection<SelectOption>({
    queryFn: async () => {
      const { data, error } = await api.wgNodeOptions();

      return {
        data: data?.map(node => ({ value: node.id, label: node.name })) ?? null,
        error,
      };
    },
    keyExtractor: option => option.value,
    autoLoad: true,
    enabled,
  });
};
