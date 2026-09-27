export interface SocketAuthenticatedPayload {
  userId: string;
}

export interface SocketAuthErrorPayload {
  message: string;
}

export interface SocketErrorPayload {
  event: string;
  message: string;
}

export interface SocketPingPayload {
  ts: number;
}

export interface SocketServerToClientEvents {
  authenticated: (data: SocketAuthenticatedPayload) => void;
  auth_error: (data: SocketAuthErrorPayload) => void;
  error: (data: SocketErrorPayload) => void;
}

export interface SocketClientToServerEvents {
  ping: (data: SocketPingPayload) => void;
}
