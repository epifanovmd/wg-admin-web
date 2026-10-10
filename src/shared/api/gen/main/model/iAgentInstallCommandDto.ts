export interface IAgentInstallCommandDto {
  /** `curl …/api/v1/agent-bundle/install.sh | sudo sh -s -- --token …`. */
  command: string;
}
