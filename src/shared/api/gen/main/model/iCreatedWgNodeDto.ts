import type { WgNodeDto } from "./wgNodeDto.ts";

/**
 * Ответ создания ноды: ключ агента возвращается только один раз.
 */
export interface ICreatedWgNodeDto {
  node: WgNodeDto;
  /** Секрет ключа агента — сохранить сразу, повторно не выдаётся. */
  agentKey: string;
  /** Команда ручной установки агента на VPS с этим ключом. */
  installCommand: string;
}
