/**
 * Ответ ротации ключа агента.
 */
export interface IWgAgentKeyDto {
  agentKey: string;
  /** Команда ручной установки агента на VPS с этим ключом. */
  installCommand: string;
}
