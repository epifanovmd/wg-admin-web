import { useWgNodeOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import {
  EWgEndpointMode,
  EWgEndpointRoute,
  EWgForwardMode,
  type WgEndpointDto,
} from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const HOST = /^[a-zA-Z0-9.:_-]+$/;

export const wgEndpointFormSchema = z
  .object({
    name: z.string().trim().min(1, "Введите название.").max(120),
    host: z
      .string()
      .trim()
      .min(1, "Введите хост.")
      .regex(HOST, "Домен или IP."),
    mode: z.enum(["direct", "relay"]),
    relayNodeId: z.string().nullable().optional(),
    forwardMode: z.enum(["dnat", "ipip"]),
    route: z.enum(["auto", "tunnel", "direct"]),
    description: z.string().trim().max(2000).optional(),
  })
  .refine(data => data.mode !== "relay" || Boolean(data.relayNodeId), {
    message: "Для режима relay выберите релей-ноду.",
    path: ["relayNodeId"],
  });

export type TWgEndpointForm = z.input<typeof wgEndpointFormSchema>;
type TWgEndpointValues = z.output<typeof wgEndpointFormSchema>;

interface UseWgEndpointFormOptions {
  onSaved: (endpoint: WgEndpointDto) => void;
}

/** Создание и редактирование точки подключения. */
export const useWgEndpointFormVM = ({ onSaved }: UseWgEndpointFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgEndpointDto | null>(null);
  const form = useZodForm(wgEndpointFormSchema);
  const mode = form.watch("mode");
  const forwardMode = form.watch("forwardMode");

  const nodes = useWgNodeOptions({ enabled: open });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      host: "",
      mode: EWgEndpointMode.direct,
      relayNodeId: null,
      forwardMode: EWgForwardMode.ipip,
      route: EWgEndpointRoute.auto,
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (endpoint: WgEndpointDto) => {
    setEditing(endpoint);
    form.reset({
      name: endpoint.name,
      host: endpoint.host,
      mode: endpoint.mode,
      relayNodeId: endpoint.relayNodeId,
      forwardMode: endpoint.forwardMode,
      route: endpoint.route,
      description: endpoint.description ?? "",
    });
    setOpen(true);
  };

  const submit = async (data: TWgEndpointValues) => {
    const body = {
      name: data.name,
      host: data.host,
      mode: data.mode,
      relayNodeId: data.mode === "relay" ? data.relayNodeId : null,
      forwardMode: data.forwardMode,
      route: data.route,
      description: data.description || null,
    };
    const res = editing
      ? await api.updateWgEndpoint(editing.id, body)
      : await api.createWgEndpoint(body);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    onSaved(res.data);
    setOpen(false);
  };

  /** Точка изменилась на сервере (живое обновление) — открытая форма видит её. */
  const syncEditing = (endpoint: WgEndpointDto) =>
    setEditing(current => (current?.id === endpoint.id ? endpoint : current));

  return {
    open,
    setOpen,
    syncEditing,
    openCreate,
    openEdit,
    editing,
    form,
    submit,
    mode,
    forwardMode,
    nodeOptions: nodes.items,
  };
};

export type WgEndpointFormVM = ReturnType<typeof useWgEndpointFormVM>;
