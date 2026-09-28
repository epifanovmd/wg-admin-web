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

/** Нода без агента: установка ещё не выполнена или идёт. */
const AWAITING_AGENT: ReadonlySet<EWgNodeStatus> = new Set([
  "created",
  "provisioning",
]);

/** Нода не отвечает: агент не выходит на связь или установка не удалась. */
const UNREACHABLE: ReadonlySet<EWgNodeStatus> = new Set(["offline", "error"]);

/**
 * Состояние конфигурации ноды: без агента и на недоступной ноде
 * «Применяется…» висело бы бесконечно — применить некому.
 */
export const nodeSyncView = (node: {
  status: EWgNodeStatus;
  inSync: boolean;
  applyError: string | null;
}): StatusView & { hint?: string } => {
  if (AWAITING_AGENT.has(node.status)) {
    return {
      label: "Ожидает агента",
      variant: "muted",
      hint: "Конфигурация применится, когда на ноде будет установлен агент",
    };
  }
  if (node.applyError) {
    return {
      label: "Ошибка применения",
      variant: "destructive",
      hint: node.applyError,
    };
  }
  if (node.inSync) return { label: "Актуальна", variant: "success" };
  if (UNREACHABLE.has(node.status)) {
    return {
      label: "Не применена",
      variant: "muted",
      hint: "Нода недоступна: конфигурация применится, когда агент выйдет на связь",
    };
  }

  return { label: "Применяется…", variant: "warning" };
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
