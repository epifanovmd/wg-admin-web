import type { IAgentWorkerBuildDto } from "./iAgentWorkerBuildDto.ts";

export interface IAgentReleaseDto {
  /** Каталог архивов для узлов задан (`AGENT_BUNDLE_DIR`). */
  bundle: boolean;
  workers: IAgentWorkerBuildDto[];
}
