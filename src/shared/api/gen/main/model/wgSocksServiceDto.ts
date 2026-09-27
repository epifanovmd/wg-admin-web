import type { IWgSocksLive } from "./iWgSocksLive.ts";
import type { WgSocksClientDto } from "./wgSocksClientDto.ts";
import type { WgSocksUserDto } from "./wgSocksUserDto.ts";

export interface WgSocksServiceDto {
  id: string;
  name: string;
  /** @nullable */
  description: string | null;
  nodeId: string;
  /** @nullable */
  nodeName: string | null;
  /**
   * publicHost ноды.
   * @nullable
   */
  nodeHost: string | null;
  listenPort: number;
  /** @nullable */
  clientHost: string | null;
  /** @nullable */
  clientPort: number | null;
  serverName: string;
  enabled: boolean;
  users: WgSocksUserDto[];
  clients: WgSocksClientDto[];
  live: IWgSocksLive | null;
  createdAt: string;
  updatedAt: string;
}
