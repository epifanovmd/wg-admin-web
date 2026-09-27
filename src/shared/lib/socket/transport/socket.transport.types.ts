import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";
import { Socket as SocketIO } from "socket.io-client";

export type SocketEventHandler = (...args: any[]) => void;
export type SocketEventsMap = Record<string, SocketEventHandler>;
export type AppSocket = SocketIO<SocketEventsMap, SocketEventsMap>;

export type SocketConnectionStatus =
  "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface SocketTransportState {
  status: SocketConnectionStatus;
  error: Error | null;
}

export type SocketStatusListener = (state: SocketTransportState) => void;

export const ISocketTransport = createInjectDecorator<ISocketTransport>();

export interface ISocketTransport extends SupportInitialize {
  readonly state: SocketTransportState;

  initialize(): () => void;
  connect(): Promise<void>;
  disconnect(): void;

  on<TArgs extends any[]>(
    event: string,
    handler: (...args: TArgs) => void,
  ): () => void;

  emit<TArgs extends any[]>(event: string, ...args: TArgs): void;

  onConnect(handler: () => void): () => void;
  onDisconnect(handler: (reason: string) => void): () => void;
  onStatusChange(listener: SocketStatusListener): () => void;
}
