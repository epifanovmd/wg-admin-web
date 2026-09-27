/**
 * Полезная нагрузка команды агенту.
 */
export interface IWgNodeCommandPayload {
  /** interface-restart: имя интерфейса. */
  interfaceName?: string;
  /** agent-logs: сколько последних строк вернуть. */
  lines?: number;
  /** agent-update: sha256 бинаря, который агент должен установить. */
  hash?: string;
}
