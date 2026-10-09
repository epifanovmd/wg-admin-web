import type { IWgNodeInstallCommandDto } from "./iWgNodeInstallCommandDto.ts";
import type { WgNodeDto } from "./wgNodeDto.ts";

/**
 * Ответ создания ноды: команда установки агента (токен — только здесь).
 */
export interface ICreatedWgNodeDto {
  node: WgNodeDto;
  install: IWgNodeInstallCommandDto;
}
