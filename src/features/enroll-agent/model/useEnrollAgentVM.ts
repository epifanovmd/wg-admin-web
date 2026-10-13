import { IMainApi } from "@shared/api";
import type { AgentEnrollmentTokenDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm, useZodForm } from "@shared/ui";
import { useState } from "react";

import {
  enrollmentTokenSchema,
  INSTALL_DEFAULTS,
  installCommandSchema,
  type TEnrollmentTokenValues,
  type TInstallCommandValues,
  tokenExpiresAt,
} from "./validation";

/** Токенов в списке — не больше (сервер отдаёт до 100 за раз). */
const TOKENS_LIMIT = 100;

const TOKEN_DEFAULTS = {
  name: "",
  expiry: "1d",
  singleUse: true,
  labels: "",
} as const;

/** Состояние токена регистрации. */
export const enrollmentTokenState = (
  token: AgentEnrollmentTokenDto,
  now = Date.now(),
): "active" | "revoked" | "expired" | "used" => {
  if (token.revokedAt) return "revoked";
  if (token.expiresAt && Date.parse(token.expiresAt) <= now) return "expired";
  if (token.maxUses != null && token.uses >= token.maxUses) return "used";

  return "active";
};

/**
 * Установка агента: токены регистрации (создание, список, отзыв) и команда
 * установки на узел. Полный токен сервер отдаёт один раз — он сразу
 * подставляется в команду.
 */
export const useEnrollAgentVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState<string | null>(null);
  const [command, setCommand] = useState<string | null>(null);

  const tokens = useCollection<AgentEnrollmentTokenDto>({
    queryFn: async () => {
      const { data, error } = await api.getAgentEnrollmentTokens({
        limit: TOKENS_LIMIT,
      });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: token => token.id,
    autoLoad: true,
    enabled: open,
  });

  const tokenForm = useZodForm(enrollmentTokenSchema, {
    defaultValues: TOKEN_DEFAULTS,
  });
  const installForm = useZodForm(installCommandSchema, {
    defaultValues: INSTALL_DEFAULTS,
  });

  const openDialog = () => {
    tokenForm.reset(TOKEN_DEFAULTS);
    installForm.reset(INSTALL_DEFAULTS);
    setIssued(null);
    setCommand(null);
    setOpen(true);
  };

  const createToken = async (values: TEnrollmentTokenValues) => {
    const res = await api.createAgentEnrollmentToken({
      name: values.name,
      labels: values.labels,
      maxUses: values.singleUse ? 1 : undefined,
      expiresAt: tokenExpiresAt(values.expiry),
    });

    if (!res.data) {
      notifyApiError(toast, res.error);

      return;
    }

    tokens.prependItem(res.data.enrollmentToken);
    setIssued(res.data.token);
    installForm.setValue("token", res.data.token);
    installForm.setValue("tokenFile", "");
    tokenForm.reset(TOKEN_DEFAULTS);
  };

  const revokeToken = async (token: AgentEnrollmentTokenDto) => {
    const ok = await confirm({
      title: `Отозвать токен «${token.name}»?`,
      description:
        "Новые агенты не смогут зарегистрироваться с ним. Уже зарегистрированные продолжат работать.",
      confirmLabel: "Отозвать",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.revokeAgentEnrollmentToken(token.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    tokens.updateItem(token.id, {
      ...token,
      revokedAt: new Date().toISOString(),
    });
  };

  const createCommand = async (values: TInstallCommandValues) => {
    const res = await api.createAgentInstallCommand(values);

    if (!res.data) {
      notifyApiError(toast, res.error);

      return;
    }

    setCommand(res.data.command);
  };

  return {
    open,
    setOpen,
    openDialog,
    tokens: tokens.items,
    isTokensLoading: tokens.isLoading,
    tokenForm,
    createToken,
    revokeToken,
    /** Созданный токен: показывается один раз, до закрытия окна. */
    issued,
    installForm,
    createCommand,
    /** Готовая команда установки. */
    command,
  };
};

export type EnrollAgentVM = ReturnType<typeof useEnrollAgentVM>;
