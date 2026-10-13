import { formatJson, parseJsonText, schemaSkeleton } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type { AgentConfigDto } from "@shared/api/gen/main/model";
import { getErrorBody, notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm, useZodForm } from "@shared/ui";
import { useState } from "react";

import type { IWorkerConfigTarget } from "./types";
import { type TWorkerConfigForm, workerConfigSchema } from "./validation";

/** Код ошибки сервера: значение не подходит под схему ключа. */
const CONFIG_INVALID = "AGENT_CONFIG_INVALID";

/** Тело ошибки сервера: что именно не так — в `details.reason`. */
interface IConfigErrorBody {
  details?: { reason?: string };
}

/** Текст ошибки схемы: общий текст и причина, если сервер её назвал. */
const invalidText = (error: { message: string }): string => {
  const reason = getErrorBody<IConfigErrorBody>(error)?.details?.reason;

  return reason ? `${error.message}. ${reason}` : error.message;
};

interface UseWorkerConfigEditorOptions {
  /** Сервер принял новую версию. */
  onSaved?: (entry: AgentConfigDto) => void;
  /** Ключ удалён (агент ещё удаляет его у себя). */
  onDeleted?: (target: IWorkerConfigTarget) => void;
}

/** Текст редактора: заданное значение или заготовка по схеме ключа. */
const initialText = (target: IWorkerConfigTarget): string =>
  formatJson(
    target.entry && target.entry.data !== undefined
      ? target.entry.data
      : schemaSkeleton(target.manifest?.schema),
  );

/**
 * Настройка воркера: JSON-значение ключа с подсказкой по схеме из манифеста,
 * запись новой версии и удаление ключа. Значение по схеме проверяет сервер —
 * его ответ показывается у поля.
 */
export const useWorkerConfigEditorVM = ({
  onSaved,
  onDeleted,
}: UseWorkerConfigEditorOptions = {}) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const [target, setTarget] = useState<IWorkerConfigTarget | null>(null);
  const form = useZodForm(workerConfigSchema, {
    defaultValues: { value: "" },
  });

  const openFor = (next: IWorkerConfigTarget) => {
    form.reset({ value: initialText(next) });
    setTarget(next);
  };

  const close = () => setTarget(null);

  const save = async ({ value }: TWorkerConfigForm) => {
    const parsed = parseJsonText(value);

    if (!target || !("value" in parsed)) return;

    const res = await api.setAgentWorkerConfig(
      target.agentId,
      target.worker,
      target.key,
      parsed.value,
    );

    if (res.error) {
      if (res.error.code === CONFIG_INVALID) {
        form.setError("value", { message: invalidText(res.error) });
      } else {
        notifyApiError(toast, res.error);
      }

      return;
    }

    toast.success(
      `${target.worker}/${target.key}: версия ${res.data.version} задана`,
    );
    onSaved?.(res.data);
    setTarget(null);
  };

  const remove = async (item: IWorkerConfigTarget) => {
    const ok = await confirm({
      title: `Удалить настройку «${item.worker}/${item.key}»?`,
      description:
        "Агент удалит ключ у себя и у воркера. Воркер продолжит работать без этой настройки.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.deleteAgentWorkerConfig(
      item.agentId,
      item.worker,
      item.key,
    );

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    toast.success(`Настройка «${item.worker}/${item.key}» удалена`);
    onDeleted?.(item);
    if (target?.key === item.key && target.worker === item.worker) {
      setTarget(null);
    }
  };

  return { target, form, openFor, close, save, remove };
};

export type WorkerConfigEditorVM = ReturnType<typeof useWorkerConfigEditorVM>;
