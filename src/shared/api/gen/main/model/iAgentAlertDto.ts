import type { IAgentAlertDtoKind } from "./iAgentAlertDtoKind.ts";

/**
 * Проблема агента.
 */
export interface IAgentAlertDto {
  kind: IAgentAlertDtoKind;
  worker?: string;
  key?: string;
  message: string;
}
