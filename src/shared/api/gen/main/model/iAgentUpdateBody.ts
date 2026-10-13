export interface IAgentUpdateBody {
  /** Версия; без неё — новая, которую агент нашёл в своём каталоге сборок. */
  version?: string;
}
