/**
 * Реализация WireGuard на ноде: модуль ядра или wireguard-go.
 */
export type EWgMode = (typeof EWgMode)[keyof typeof EWgMode];

export const EWgMode = {
  kernel: "kernel",
  userspace: "userspace",
} as const;
