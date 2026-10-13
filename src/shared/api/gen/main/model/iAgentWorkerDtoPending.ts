/**
 * Плановая замена ждёт, пока воркер занят.
 */
export type IAgentWorkerDtoPending =
  (typeof IAgentWorkerDtoPending)[keyof typeof IAgentWorkerDtoPending];

export const IAgentWorkerDtoPending = {
  restart: "restart",
  update: "update",
} as const;
