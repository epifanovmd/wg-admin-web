import type {
  IWgAgentReleaseInfo,
  WgNodeDto,
} from "@shared/api/gen/main/model";

export type TAgentNode = Pick<
  WgNodeDto,
  "agentVersion" | "agentCodeHash" | "osInfo"
>;

type TAgentArch = keyof IWgAgentReleaseInfo["hashes"];

const isAgentArch = (arch: string | undefined): arch is TAgentArch =>
  arch === "amd64" || arch === "arm64";

/** Обновление доступно, когда бинарь ноды отличается от релиза её архитектуры. */
export const resolveAgentUpdate = (
  node: TAgentNode,
  release: IWgAgentReleaseInfo | null,
): "none" | "available" => {
  if (!release?.version || !node.agentVersion) return "none";

  const arch = node.osInfo?.arch;
  const hash = isAgentArch(arch) ? release.hashes[arch] : undefined;

  return hash && hash !== node.agentCodeHash ? "available" : "none";
};
