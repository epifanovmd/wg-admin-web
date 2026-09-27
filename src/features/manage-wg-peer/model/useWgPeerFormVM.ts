import { useWgInterfaceOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import type { SelectOption } from "@shared/ui";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const WG_KEY = /^[A-Za-z0-9+/]{42}[AEIMQUYcgkosw048]=$/;

export const wgPeerFormSchema = z.object({
  interfaceId: z.string().min(1, "Выберите интерфейс."),
  name: z.string().trim().min(1, "Введите название.").max(120),
  description: z.string().trim().max(2000).optional(),
  userId: z.string().nullable().optional(),
  publicKey: z
    .string()
    .trim()
    .regex(WG_KEY, "Ключ WireGuard — 44 символа base64.")
    .optional()
    .or(z.literal("")),
  withPresharedKey: z.boolean().default(true),
  clientAllowedIPs: z.string().trim().optional().or(z.literal("")),
  clientDns: z.string().trim().optional().or(z.literal("")),
  persistentKeepalive: z.number().int().min(0).max(3600).default(25),
  expiresAt: z.date().optional(),
});

export type TWgPeerForm = z.input<typeof wgPeerFormSchema>;
type TWgPeerValues = z.output<typeof wgPeerFormSchema>;

interface UseWgPeerFormOptions {
  /** Предвыбранный интерфейс (со страницы ноды). */
  interfaceId?: string;
  onSaved: (peer: WgPeerDto) => void;
}

/** Создание и редактирование пира. */
export const useWgPeerFormVM = ({
  interfaceId,
  onSaved,
}: UseWgPeerFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgPeerDto | null>(null);
  const form = useZodForm(wgPeerFormSchema);

  const interfaces = useWgInterfaceOptions({
    enabled: open,
    withAddress: true,
  });

  const users = useCollection<SelectOption, boolean>({
    queryFn: async () => {
      const { data, error } = await api.getUserOptions();

      return {
        data:
          data?.data.map(option => ({
            value: option.id,
            label: option.name ?? option.id,
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
      interfaceId: interfaceId ?? "",
      name: "",
      description: "",
      userId: null,
      publicKey: "",
      withPresharedKey: true,
      clientAllowedIPs: "0.0.0.0/0, ::/0",
      clientDns: "",
      persistentKeepalive: 25,
      expiresAt: undefined,
    });
    setOpen(true);
  };

  const openEdit = (peer: WgPeerDto) => {
    setEditing(peer);
    form.reset({
      interfaceId: peer.interfaceId,
      name: peer.name,
      description: peer.description ?? "",
      userId: peer.userId,
      publicKey: "",
      withPresharedKey: peer.hasPresharedKey,
      clientAllowedIPs: peer.clientAllowedIPs,
      clientDns: peer.clientDns ?? "",
      persistentKeepalive: peer.persistentKeepalive,
      expiresAt: peer.expiresAt ? new Date(peer.expiresAt) : undefined,
    });
    setOpen(true);
  };

  const submit = async (data: TWgPeerValues) => {
    const res = editing
      ? await api.updateWgPeer(editing.id, {
          name: data.name,
          description: data.description || null,
          clientAllowedIPs: data.clientAllowedIPs || undefined,
          clientDns: data.clientDns || null,
          persistentKeepalive: data.persistentKeepalive,
          expiresAt: data.expiresAt?.toISOString() ?? null,
        })
      : await api.createWgPeer({
          interfaceId: data.interfaceId,
          name: data.name,
          description: data.description || null,
          userId: data.userId || null,
          publicKey: data.publicKey || null,
          withPresharedKey: data.withPresharedKey,
          clientAllowedIPs: data.clientAllowedIPs || undefined,
          clientDns: data.clientDns || null,
          persistentKeepalive: data.persistentKeepalive,
          expiresAt: data.expiresAt?.toISOString() ?? null,
        });

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    // Смена держателя при редактировании — отдельными вызовами assign/revoke.
    if (editing && data.userId !== editing.userId) {
      const assignRes = data.userId
        ? await api.assignWgPeer(editing.id, { userId: data.userId })
        : await api.revokeWgPeer(editing.id);

      if (assignRes.error) notifyApiError(toast, assignRes.error);
      else {
        onSaved(assignRes.data);
        setOpen(false);

        return;
      }
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
    interfaceOptions: interfaces.items,
    userOptions: users.items,
  };
};

export type WgPeerFormVM = ReturnType<typeof useWgPeerFormVM>;
