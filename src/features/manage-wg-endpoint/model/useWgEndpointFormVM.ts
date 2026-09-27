import { useWgNodeOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import {
  EWgEndpointMode,
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

  const nodes = useWgNodeOptions({ enabled: open });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      host: "",
      mode: EWgEndpointMode.direct,
      relayNodeId: null,
      forwardMode: EWgForwardMode.dnat,
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

  return {
    open,
    setOpen,
    openCreate,
    openEdit,
    editing,
    form,
    submit,
    mode,
    nodeOptions: nodes.items,
  };
};

export type WgEndpointFormVM = ReturnType<typeof useWgEndpointFormVM>;
