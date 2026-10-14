/**
 * Способ установки агента ноды: `systemd` — служба от root (по умолчанию), `docker` — Docker
 * Compose из архива агента (контейнер в сети узла, команда без sudo).
 */
export type TWgNodeInstallMode =
  (typeof TWgNodeInstallMode)[keyof typeof TWgNodeInstallMode];

export const TWgNodeInstallMode = {
  systemd: "systemd",
  docker: "docker",
} as const;
