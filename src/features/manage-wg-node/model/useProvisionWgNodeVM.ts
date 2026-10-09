import { IMainApi } from "@shared/api";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

export const provisionSchema = z
  .object({
    host: z.string().trim().min(1, "IP или домен VPS."),
    port: z.number().int().min(1).max(65535).default(22),
    username: z.string().trim().min(1).max(32).default("root"),
    privateKey: z.string().trim().optional(),
    password: z.string().optional(),
    backendUrl: z
      .url("Полный URL, например https://api.example.com")
      .optional()
      .or(z.literal("")),
  })
  .refine(data => data.privateKey || data.password, {
    message: "Нужен SSH-ключ или пароль.",
    path: ["privateKey"],
  });

export type TProvisionForm = z.input<typeof provisionSchema>;
type TProvisionValues = z.output<typeof provisionSchema>;

interface UseProvisionOptions {
  onStarted?: (jobId: string) => void;
}

/** Что делает задача по SSH: установка или удаление агента. */
export type TSshJobMode = "install" | "uninstall";

/**
 * Установка и удаление агента на VPS по SSH: бэкенд ставит задачу, установщик
 * ставит службу agent-wg с воркерами wg и socks; SSH-данные используются один раз.
 */
export const useProvisionWgNodeVM = ({ onStarted }: UseProvisionOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [node, setNode] = useState<WgNodeDto | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [mode, setMode] = useState<TSshJobMode>("install");
  const form = useZodForm(provisionSchema);

  /** `uninstall` — удалить агента: те же SSH-данные, без URL бэкенда. */
  const openFor = (target: WgNodeDto, nextMode: TSshJobMode = "install") => {
    setMode(nextMode);
    setJobId(null);
    form.reset({
      host: target.publicHost ?? "",
      port: 22,
      username: "root",
      privateKey: "",
      password: "",
      backendUrl: "",
    });
    setNode(target);
  };

  const close = () => setNode(null);

  const submit = async (data: TProvisionValues) => {
    if (!node) return;

    const access = {
      host: data.host,
      port: data.port,
      username: data.username,
      privateKey: data.privateKey || undefined,
      password: data.password || undefined,
    };
    const res =
      mode === "uninstall"
        ? await api.uninstallWgNode(node.id, access)
        : await api.provisionWgNode(node.id, {
            ...access,
            backendUrl: data.backendUrl || undefined,
          });

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setJobId(res.data.jobId);
    toast.success("Прогресс виден в задачах и на карточке ноды", {
      title: mode === "uninstall" ? "Удаление запущено" : "Установка запущена",
    });
    onStarted?.(res.data.jobId);
  };

  return { node, mode, openFor, close, form, submit, jobId };
};
