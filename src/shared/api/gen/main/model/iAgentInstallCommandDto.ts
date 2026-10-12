export interface IAgentInstallCommandDto {
  /** `curl …/api/v1/agent-link/bundle/install.sh | sudo sh -s -- --token …`. */
  command: string;
}
