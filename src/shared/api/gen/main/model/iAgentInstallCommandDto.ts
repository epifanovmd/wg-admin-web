export interface IAgentInstallCommandDto {
  /** `curl …/api/v1/agent-link/bundle/install.sh | sudo sh -s -- --server … --bundle … --token …`. */
  command: string;
}
