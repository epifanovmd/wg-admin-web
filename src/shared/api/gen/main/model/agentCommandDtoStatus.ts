export type AgentCommandDtoStatus =
  (typeof AgentCommandDtoStatus)[keyof typeof AgentCommandDtoStatus];

export const AgentCommandDtoStatus = {
  pending: "pending",
  done: "done",
} as const;
