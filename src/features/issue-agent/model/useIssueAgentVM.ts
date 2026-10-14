import { IMainApi } from "@shared/api";
import type {
  IAgentInstallOptionsDto,
  IAgentIssuedEnvDto,
  IAgentIssuedLinkDto,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { downloadBlob } from "@shared/lib/utils";
import { useZodForm } from "@shared/ui";
import { useEffect, useState } from "react";

import {
  DEFAULT_ISSUE_MINUTES,
  issueAgentSchema,
  issueBody,
  type TIssueAgentValues,
} from "./validation";

/** Кому выдаём агента: ноде (токен с меткой ноды) или просто агента (раздел агентов). */
export type TIssueTarget = { node: WgNodeDto } | { node?: undefined };

/**
 * Выдача агента получателю: архив агента (все платформы) с `.env` (адрес, одноразовый токен,
 * имя) — файлом или одноразовой ссылкой, либо только `.env` (для общего архива или образа).
 * Что в архиве (платформы, есть ли запуск в Docker) — с сервера.
 */
export const useIssueAgentVM = (target: TIssueTarget) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [options, setOptions] = useState<IAgentInstallOptionsDto | null>(null);
  const [link, setLink] = useState<IAgentIssuedLinkDto | null>(null);
  const [env, setEnv] = useState<IAgentIssuedEnvDto | null>(null);
  const [busy, setBusy] = useState<"archive" | "link" | "env" | null>(null);
  const form = useZodForm(issueAgentSchema, {
    defaultValues: {
      name: target.node?.name ?? "",
      expiresInMinutes: DEFAULT_ISSUE_MINUTES,
      maxUses: 1,
      baseUrl: "",
    },
  });
  const nodeId = target.node?.id;

  useEffect(() => {
    let alive = true;

    void api.getAgentInstallOptions().then(res => {
      if (!alive) return;
      if (res.error) {
        notifyApiError(toast, res.error);

        return;
      }
      setOptions(res.data);
    });

    return () => {
      alive = false;
    };
  }, [api, toast]);

  const run = async <T>(
    kind: "archive" | "link" | "env",
    request: () => Promise<{ data?: T; error?: unknown }>,
  ): Promise<T | null> => {
    setBusy(kind);
    try {
      const res = await request();

      if (res.error) {
        notifyApiError(toast, res.error as never);

        return null;
      }

      return res.data ?? null;
    } finally {
      setBusy(null);
    }
  };

  const downloadArchive = async (data: TIssueAgentValues) => {
    const body = issueBody(data);
    const blob = await run<unknown>("archive", () =>
      nodeId
        ? api.issueWgNodeAgentArchive(nodeId, body, { responseType: "blob" })
        : api.issueAgentArchive(
            { ...body, maxUses: data.maxUses },
            { responseType: "blob" },
          ),
    );

    if (!blob) return;
    downloadBlob(blob as Blob, options?.archive?.file ?? "agent.tar.gz");
    toast.success("Токен в архиве одноразовый — передайте архив получателю", {
      title: "Архив с токеном скачан",
    });
  };

  const createLink = async (data: TIssueAgentValues) => {
    const body = issueBody(data);
    const created = await run<IAgentIssuedLinkDto>("link", () =>
      nodeId
        ? api.issueWgNodeAgentLink(nodeId, body)
        : api.issueAgentLink({ ...body, maxUses: data.maxUses }),
    );

    if (created) setLink(created);
  };

  const createEnv = async (data: TIssueAgentValues) => {
    const body = issueBody(data);
    const issued = await run<IAgentIssuedEnvDto>("env", () =>
      nodeId
        ? api.issueWgNodeAgentEnv(nodeId, body)
        : api.issueAgentEnv({ ...body, maxUses: data.maxUses }),
    );

    if (issued) setEnv(issued);
  };

  const downloadEnv = () => {
    if (env) downloadBlob(new Blob([env.env], { type: "text/plain" }), ".env");
  };

  return {
    form,
    options,
    forNode: !!nodeId,
    busy,
    link,
    env,
    downloadArchive,
    createLink,
    createEnv,
    downloadEnv,
  };
};

export type IssueAgentVM = ReturnType<typeof useIssueAgentVM>;
