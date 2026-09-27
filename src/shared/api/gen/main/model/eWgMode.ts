/**
 * Реализация WireGuard на ноде. `userspace` (wireguard-go) живёт в процессе
 * агента: перезапуск контейнера агента роняет интерфейсы.
 */
export type EWgMode = (typeof EWgMode)[keyof typeof EWgMode];

export const EWgMode = {
  kernel: "kernel",
  userspace: "userspace",
} as const;
