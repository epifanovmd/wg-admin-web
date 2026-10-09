import type { IAgentManifestConfigDto } from "./iAgentManifestConfigDto.ts";
import type { IAgentManifestEventDto } from "./iAgentManifestEventDto.ts";
import type { IAgentManifestJobDto } from "./iAgentManifestJobDto.ts";
import type { IAgentManifestRequestDto } from "./iAgentManifestRequestDto.ts";
import type { IAgentManifestRouteDto } from "./iAgentManifestRouteDto.ts";

/**
 * Манифест воркера — ответ `GET /manifest`: что воркер умеет (каталог
 * возможностей). Агент пропускает только объявленное: маршруты, типы задач,
 * события, запросы к серверу, ключи настроек.
 */
export interface IAgentWorkerManifestDto {
  version: string;
  description?: string;
  configs: IAgentManifestConfigDto[];
  routes: IAgentManifestRouteDto[];
  events: IAgentManifestEventDto[];
  jobs: IAgentManifestJobDto[];
  requests: IAgentManifestRequestDto[];
}
