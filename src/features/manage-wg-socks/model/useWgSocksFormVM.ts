import { useWgNodeOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { optionalNumber } from "@shared/lib/validation";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const HOST = /^[a-zA-Z0-9.-]+$/;
const port = z
  .number({ message: "Введите порт." })
  .int()
  .min(1, "Порт — от 1.")
  .max(65535, "Порт — до 65535.");

export type TWgSocksFormMode = "create" | "edit";

export const wgSocksFormSchema = z.object({
  mode: z.enum(["create", "edit"]),
  name: z.string().trim().min(1, "Введите название.").max(120),
  nodeId: z.string().min(1, "Выберите ноду."),
  listenPort: port,
  clientHost: z
    .string()
    .trim()
    .max(253)
    .refine(value => !value || HOST.test(value), "IP или домен.")
    .optional(),
  clientPort: optionalNumber(port),
  enabled: z.boolean(),
  description: z.string().trim().max(2000).optional(),
});

export type TWgSocksForm = z.input<typeof wgSocksFormSchema>;
type TWgSocksValues = z.output<typeof wgSocksFormSchema>;

interface UseWgSocksFormOptions {
  onSaved: (service: WgSocksServiceDto) => void;
}

const EMPTY: TWgSocksForm = {
  mode: "create",
  name: "",
  nodeId: "",
  listenPort: 8443,
  clientHost: "",
  clientPort: null,
  enabled: true,
  description: "",
};

/** Создание и изменение прокси. */
export const useWgSocksFormVM = ({ onSaved }: UseWgSocksFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgSocksServiceDto | null>(null);
  const form = useZodForm(wgSocksFormSchema);
  const mode = form.watch("mode");

  const nodes = useWgNodeOptions({ enabled: open });

  const openCreate = () => {
    setEditing(null);
    form.reset(EMPTY);
    setOpen(true);
  };

  const openEdit = (service: WgSocksServiceDto) => {
    setEditing(service);
    form.reset({
      ...EMPTY,
      mode: "edit",
      name: service.name,
      nodeId: service.nodeId,
      listenPort: service.listenPort,
      clientHost: service.clientHost ?? "",
      clientPort: service.clientPort,
      enabled: service.enabled,
      description: service.description ?? "",
    });
    setOpen(true);
  };

  const submit = async (data: TWgSocksValues) => {
    const common = {
      name: data.name,
      listenPort: data.listenPort,
      clientHost: data.clientHost || null,
      clientPort: data.clientPort ?? null,
      description: data.description || null,
    };
    const res =
      data.mode === "edit" && editing
        ? await api.updateWgSocks(editing.id, {
            ...common,
            enabled: data.enabled,
          })
        : await api.createWgSocks({ ...common, nodeId: data.nodeId });

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    onSaved(res.data);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    openCreate,
    openEdit,
    editing,
    mode: mode as TWgSocksFormMode,
    form,
    submit,
    nodeOptions: nodes.items,
  };
};

export type WgSocksFormVM = ReturnType<typeof useWgSocksFormVM>;
