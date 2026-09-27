import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { optionalNumber } from "@shared/lib/validation";
import type { SelectOption } from "@shared/ui";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const IFACE_NAME = /^[a-zA-Z0-9_=+.-]{1,15}$/;
const CIDR_V4 = /^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/;
const port = z
  .number({ message: "Введите порт." })
  .int("Порт — целое число.")
  .min(1, "Порт — от 1 до 65535.")
  .max(65535, "Порт — от 1 до 65535.");

export const wgInterfaceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(IFACE_NAME, "До 15 символов: буквы, цифры, `_ = + . -`."),
  listenPort: port,
  addressCidr: z
    .string()
    .trim()
    .regex(CIDR_V4, "IPv4 CIDR, например 10.0.0.1/24."),
  addressV6Cidr: z.string().trim().optional().or(z.literal("")),
  dns: z.string().trim().optional().or(z.literal("")),
  // Очищенное числовое поле отдаёт null — это «по умолчанию».
  mtu: optionalNumber(
    z
      .number()
      .int("MTU — целое число.")
      .min(1280, "MTU — от 1280 до 9000.")
      .max(9000, "MTU — от 1280 до 9000."),
  ),
  endpointId: z.string().nullable().optional(),
  /** Пусто — как порт интерфейса. */
  endpointPort: optionalNumber(port),
  natEnabled: z.boolean().default(true),
});

export type TWgInterfaceForm = z.input<typeof wgInterfaceFormSchema>;
type TWgInterfaceValues = z.output<typeof wgInterfaceFormSchema>;

interface UseWgInterfaceFormOptions {
  nodeId: string;
  onSaved: (iface: WgInterfaceDto) => void;
}

/** Создание и редактирование WireGuard-интерфейса ноды. */
export const useWgInterfaceFormVM = ({
  nodeId,
  onSaved,
}: UseWgInterfaceFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgInterfaceDto | null>(null);
  const form = useZodForm(wgInterfaceFormSchema);

  const endpoints = useCollection<SelectOption, boolean>({
    queryFn: async () => {
      const { data, error } = await api.wgEndpointOptions();

      return {
        data:
          data?.map(option => ({
            value: option.id,
            label: `${option.name} (${option.host})`,
          })) ?? null,
        error,
      };
    },
    enabled: open,
    watch: [open],
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "wg0",
      listenPort: 51820,
      addressCidr: "10.8.0.1/24",
      addressV6Cidr: "",
      dns: "1.1.1.1, 8.8.8.8",
      endpointId: null,
      natEnabled: true,
    });
    setOpen(true);
  };

  const openEdit = (iface: WgInterfaceDto) => {
    setEditing(iface);
    form.reset({
      name: iface.name,
      listenPort: iface.listenPort,
      addressCidr: iface.addressCidr,
      addressV6Cidr: iface.addressV6Cidr ?? "",
      dns: iface.dns ?? "",
      mtu: iface.mtu ?? undefined,
      endpointId: iface.endpointId,
      endpointPort: iface.endpointPort ?? undefined,
      natEnabled: iface.natEnabled,
    });
    setOpen(true);
  };

  const submit = async (data: TWgInterfaceValues) => {
    const body = {
      name: data.name,
      listenPort: data.listenPort,
      addressCidr: data.addressCidr,
      addressV6Cidr: data.addressV6Cidr || null,
      dns: data.dns || null,
      mtu: data.mtu ?? null,
      endpointId: data.endpointId || null,
      endpointPort: data.endpointPort ?? null,
      natEnabled: data.natEnabled,
    };
    const res = editing
      ? await api.updateWgInterface(editing.id, body)
      : await api.createWgInterface({ ...body, nodeId });

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
    endpointOptions: endpoints.items,
  };
};

export type WgInterfaceFormVM = ReturnType<typeof useWgInterfaceFormVM>;
