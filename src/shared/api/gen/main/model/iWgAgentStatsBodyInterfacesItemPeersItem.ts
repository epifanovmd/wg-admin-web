export type IWgAgentStatsBodyInterfacesItemPeersItem = {
  /** @nullable */
  endpoint: string | null;
  /** @nullable */
  lastHandshake: number | null;
  txBytes: number;
  rxBytes: number;
  publicKey: string;
};
