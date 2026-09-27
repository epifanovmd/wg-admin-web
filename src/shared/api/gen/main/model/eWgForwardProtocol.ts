export type EWgForwardProtocol =
  (typeof EWgForwardProtocol)[keyof typeof EWgForwardProtocol];

export const EWgForwardProtocol = {
  udp: "udp",
  tcp: "tcp",
} as const;
