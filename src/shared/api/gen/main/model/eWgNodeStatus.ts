/**
 * Статус ноды: online/offline — живость агента, provisioning — идёт установка.
 */
export type EWgNodeStatus = (typeof EWgNodeStatus)[keyof typeof EWgNodeStatus];

export const EWgNodeStatus = {
  created: "created",
  provisioning: "provisioning",
  online: "online",
  offline: "offline",
  error: "error",
} as const;
