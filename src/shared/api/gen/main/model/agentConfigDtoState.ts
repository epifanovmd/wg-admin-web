/**
 * `pending` — воркер ещё не применил эту версию.
 */
export type AgentConfigDtoState =
  (typeof AgentConfigDtoState)[keyof typeof AgentConfigDtoState];

export const AgentConfigDtoState = {
  pending: "pending",
  applied: "applied",
  failed: "failed",
} as const;
