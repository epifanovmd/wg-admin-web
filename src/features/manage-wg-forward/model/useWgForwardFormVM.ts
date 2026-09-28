import { IUserStore } from "@entities/user";
import { useWgNodeOptions, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgForwardDto, WgInterfaceDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const IPV4_OR_HOST = /^[a-zA-Z0-9.-]+$/;
const port = z
  .number({ message: "Введите порт." })
  .int()
  .min(1, "Порт — от 1.")
  .max(65535, "Порт — до 65535.");

export const wgForwardFormSchema = z
  .object({
    name: z.string().trim().min(1, "Введите название.").max(120),
    relayNodeId: z.string().min(1, "Выберите релей."),
    protocol: z.enum(["udp", "tcp"]),
    listenPort: port,
    targetNodeId: z.string().nullable().optional(),
    targetHost: z
      .string()
      .trim()
      .max(255)
      .refine(value => !value || IPV4_OR_HOST.test(value), "IP или домен.")
      .optional(),
    targetPort: port,
    path: z.enum(["direct", "ipip"]),
    route: z.enum(["auto", "tunnel", "direct"]),
    enabled: z.boolean(),
    description: z.string().trim().max(2000).optional(),
  })
  .refine(data => Boolean(data.targetNodeId || data.targetHost), {
    message: "Укажите ноду-цель или адрес.",
    path: ["targetHost"],
  })
  .refine(data => data.path !== "ipip" || Boolean(data.targetNodeId), {
    message: "Через туннель — только до ноды с агентом.",
    path: ["targetNodeId"],
  });

export type TWgForwardForm = z.input<typeof wgForwardFormSchema>;
type TWgForwardValues = z.output<typeof wgForwardFormSchema>;

interface UseWgForwardFormOptions {
  onSaved: (forward: WgForwardDto) => void;
}

/** Создание и изменение проброса порта на релее. */
export const useWgForwardFormVM = ({ onSaved }: UseWgForwardFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgForwardDto | null>(null);
  const form = useZodForm(wgForwardFormSchema);
  const path = form.watch("path");
  const protocol = form.watch("protocol");
  const targetNodeId = form.watch("targetNodeId");
  const targetPort = form.watch("targetPort");
  const canViewInterfaces = IUserStore.useInstance().can(
    WG_PERMISSIONS.INTERFACE_VIEW,
  );

  // Интерфейсы ноды-цели: проброс на порт интерфейса панели — подсказка про точку.
  const targetInterfaces = useEntity<WgInterfaceDto[], string>({
    queryFn: async nodeId => {
      const { data, error } = await api.listWgInterfaces({
        nodeId,
        limit: 100,
      });

      return { data: data?.items ?? null, error };
    },
    watch: [targetNodeId ?? ""],
    enabled: open && !!targetNodeId && canViewInterfaces,
  });

  const nodes = useWgNodeOptions({ enabled: open });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      relayNodeId: "",
      protocol: "udp",
      listenPort: 51820,
      targetNodeId: null,
      targetHost: "",
      targetPort: 51820,
      path: "ipip",
      route: "auto",
      enabled: true,
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (forward: WgForwardDto) => {
    setEditing(forward);
    form.reset({
      name: forward.name,
      relayNodeId: forward.relayNodeId,
      protocol: forward.protocol,
      listenPort: forward.listenPort,
      targetNodeId: forward.targetNodeId,
      targetHost: forward.targetHost ?? "",
      targetPort: forward.targetPort,
      path: forward.path,
      route: forward.route,
      enabled: forward.enabled,
      description: forward.description ?? "",
    });
    setOpen(true);
  };

  const submit = async (data: TWgForwardValues) => {
    const common = {
      name: data.name,
      listenPort: data.listenPort,
      targetNodeId: data.targetNodeId || null,
      targetHost: data.targetHost || null,
      targetPort: data.targetPort,
      path: data.path,
      route: data.route,
      enabled: data.enabled,
      description: data.description || null,
    };
    const res = editing
      ? await api.updateWgForward(editing.id, common)
      : await api.createWgForward({
          ...common,
          relayNodeId: data.relayNodeId,
          protocol: data.protocol,
        });

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
    path,
    /** Порт цели — интерфейс панели на ноде-цели: копии проброс не видит. */
    get panelInterface() {
      if (protocol !== "udp" || !targetNodeId) return null;

      return (
        targetInterfaces.data?.find(
          iface =>
            iface.nodeId === targetNodeId && iface.listenPort === targetPort,
        ) ?? null
      );
    },
    nodeOptions: nodes.items,
  };
};

export type WgForwardFormVM = ReturnType<typeof useWgForwardFormVM>;
