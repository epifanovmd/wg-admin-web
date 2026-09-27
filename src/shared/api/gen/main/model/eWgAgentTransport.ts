/**
 * Канал связи агента с бэкендом.
 */
export type EWgAgentTransport =
  (typeof EWgAgentTransport)[keyof typeof EWgAgentTransport];

export const EWgAgentTransport = {
  link: "link",
  http: "http",
} as const;
