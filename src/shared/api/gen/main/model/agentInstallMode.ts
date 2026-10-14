export type AgentInstallMode =
  (typeof AgentInstallMode)[keyof typeof AgentInstallMode];

export const AgentInstallMode = {
  systemd: "systemd",
  rootless: "rootless",
  run: "run",
  docker: "docker",
} as const;
