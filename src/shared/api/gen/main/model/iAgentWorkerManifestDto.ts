import type { IAgentManifestCommandDto } from "./iAgentManifestCommandDto.ts";
import type { IAgentManifestConfigDto } from "./iAgentManifestConfigDto.ts";
import type { IAgentManifestEventDto } from "./iAgentManifestEventDto.ts";
import type { IAgentManifestRequestDto } from "./iAgentManifestRequestDto.ts";

/**
 * Что воркер умеет (его регистрация на агенте).
 */
export interface IAgentWorkerManifestDto {
  description?: string;
  configs?: IAgentManifestConfigDto[];
  commands?: IAgentManifestCommandDto[];
  events?: IAgentManifestEventDto[];
  requests?: IAgentManifestRequestDto[];
}
