export type IWgAgentForwardProto =
  (typeof IWgAgentForwardProto)[keyof typeof IWgAgentForwardProto];

export const IWgAgentForwardProto = {
  udp: "udp",
  tcp: "tcp",
} as const;
