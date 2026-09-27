import type {
  EWgInterfaceStatus,
  EWgNodeStatus,
} from "@shared/api/gen/main/model";

type BadgeVariant =
  "success" | "warning" | "destructive" | "muted" | "info" | "outline";

interface StatusView {
  label: string;
  variant: BadgeVariant;
}

export const NODE_STATUS: Record<EWgNodeStatus, StatusView> = {
  created: { label: "Ожидает агента", variant: "muted" },
  provisioning: { label: "Установка…", variant: "info" },
  online: { label: "Online", variant: "success" },
  offline: { label: "Offline", variant: "destructive" },
  error: { label: "Ошибка", variant: "destructive" },
};

export const INTERFACE_STATUS: Record<EWgInterfaceStatus, StatusView> = {
  up: { label: "Up", variant: "success" },
  down: { label: "Down", variant: "muted" },
  error: { label: "Ошибка", variant: "destructive" },
  unknown: { label: "Неизвестно", variant: "outline" },
};

/** Состояние пира: включённость + фактический онлайн по handshake. */
export const peerStateView = (peer: {
  enabled: boolean;
  isOnline: boolean;
  disabledReason?: string | null;
}): StatusView => {
  if (!peer.enabled) {
    return {
      label: peer.disabledReason === "expired" ? "Истёк" : "Выключен",
      variant: "muted",
    };
  }

  return peer.isOnline
    ? { label: "Онлайн", variant: "success" }
    : { label: "Офлайн", variant: "outline" };
};
