import type { BadgeProps } from "@shared/ui";

type AuditTone = NonNullable<BadgeProps["variant"]>;

interface AuditEventMeta {
  label: string;
  tone: AuditTone;
}

const EVENTS: Record<string, AuditEventMeta> = {
  "auth.login.succeeded": { label: "Вход", tone: "success" },
  "auth.login.failed": { label: "Неудачный вход", tone: "destructive" },
  "auth.account.locked": { label: "Аккаунт заблокирован", tone: "destructive" },
  "auth.2fa.enabled": { label: "2FA включена", tone: "info" },
  "auth.2fa.disabled": { label: "2FA отключена", tone: "warning" },
  "auth.password.changed": { label: "Пароль изменён", tone: "info" },
  "auth.password.reset": { label: "Пароль сброшен", tone: "warning" },
  "auth.signed-out": { label: "Выход", tone: "muted" },
  "auth.signed-out-all": {
    label: "Выход на всех устройствах",
    tone: "warning",
  },
  "session.terminated": { label: "Сессия завершена", tone: "muted" },
  "passkey.added": { label: "Passkey добавлен", tone: "info" },
  "passkey.removed": { label: "Passkey удалён", tone: "warning" },
  "api-key.created": { label: "API-ключ создан", tone: "info" },
  "api-key.revoked": { label: "API-ключ отозван", tone: "warning" },
};

/** Типы событий журнала, известные клиенту, — для фильтров. */
export const AUDIT_EVENT_TYPES = Object.keys(EVENTS);

/** Подпись и оттенок события; неизвестный тип показывается как есть. */
export const auditEventMeta = (type: string): AuditEventMeta =>
  EVENTS[type] ?? { label: type, tone: "outline" };
