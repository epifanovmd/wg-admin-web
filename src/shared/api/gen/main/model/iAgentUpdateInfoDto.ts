/**
 * Новая версия агента из его собственной проверки обновлений.
 */
export interface IAgentUpdateInfoDto {
  latest: string;
  /** Когда агент проверял, мс. */
  checkedAt: number;
}
