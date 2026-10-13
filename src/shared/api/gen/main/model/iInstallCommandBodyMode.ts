export type IInstallCommandBodyMode =
  (typeof IInstallCommandBodyMode)[keyof typeof IInstallCommandBodyMode];

export const IInstallCommandBodyMode = {
  systemd: "systemd",
  rootless: "rootless",
  run: "run",
} as const;
