/** Фильтры списка пиров; все — необязательные, пусто — без ограничения. */
export interface IWgPeersFilters {
  nodeId?: string;
  interfaceId?: string;
  userId?: string;
  /** true — только включённые, false — только выключенные. */
  enabled?: boolean;
  online?: boolean;
  query?: string;
}

/** Фильтры без пустых значений: для адреса страницы и запроса API. */
export const compactPeersFilters = (
  filters: IWgPeersFilters,
): IWgPeersFilters =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "" && value !== null,
    ),
  ) as IWgPeersFilters;
