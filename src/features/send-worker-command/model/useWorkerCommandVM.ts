import {
  agentWorkers,
  formatJson,
  type IAgentCommandEvent,
  parseJsonText,
  schemaFormBody,
  schemaFormDefaults,
  schemaFormFields,
  schemaSkeleton,
  waitAgentCommand,
} from "@entities/agent";
import { IMainApi } from "@shared/api";
import type { AgentCommandDto, AgentDto } from "@shared/api/gen/main/model";
import { getErrorBody, notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useZodForm } from "@shared/ui";
import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

import {
  type TArgsMode,
  type TWorkerCommandForm,
  workerCommandSchema,
} from "./validation";

/** Сколько последних команд показывать. */
const HISTORY_LIMIT = 20;

/** Код ошибки сервера: аргументы не подходят под схему команды. */
const COMMAND_INVALID = "AGENT_COMMAND_INVALID";

/** Текст ошибки схемы: общий текст и причина, если сервер её назвал. */
const invalidText = (error: { message: string }): string => {
  const reason = getErrorBody<{ details?: { reason?: string } }>(error)?.details
    ?.reason;

  return reason ? `${error.message}. ${reason}` : error.message;
};

/**
 * Консоль команд воркеру: только команды из манифеста воркера (другие агент не
 * пропустит), аргументы — формой по схеме команды или JSON, срок ответа. Итоги
 * и ход — список последних команд: событие `agent:command` комнаты агента и
 * длинный опрос итога (если событие потерялось). Идущую команду можно отменить.
 */
export const useWorkerCommandVM = (agent: AgentDto) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const workers = agentWorkers(agent);
  const [history, setHistory] = useState<AgentCommandDto[]>([]);
  const aborts = useRef(new Set<AbortController>());
  // По умолчанию — первый воркер с командами.
  const initial = workers.find(w => w.manifest?.commands?.length) ?? workers[0];
  const form = useZodForm(workerCommandSchema, {
    defaultValues: {
      worker: initial?.name ?? "",
      type: initial?.manifest?.commands?.[0]?.type ?? "",
      argsMode: "form",
      fields: {},
      args: "",
      timeoutSec: null,
    },
  });
  const [workerName, type, argsMode] = useWatch({
    control: form.control,
    name: ["worker", "type", "argsMode"],
  });
  const worker = workers.find(w => w.name === workerName) ?? null;
  const commands = worker?.manifest?.commands ?? [];
  const command = commands.find(c => c.type === type) ?? null;
  const fields = command ? schemaFormFields(command.schema) : null;
  const mode: TArgsMode = fields ? argsMode : "json";

  // Другой воркер — его первая команда.
  useEffect(() => {
    if (!commands.some(c => c.type === form.getValues("type"))) {
      form.setValue("type", commands[0]?.type ?? "");
    }
  }, [workerName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Другая команда — заготовка аргументов по её схеме.
  useEffect(() => {
    form.setValue(
      "fields",
      fields && command ? schemaFormDefaults(command.schema, fields) : {},
    );
    form.setValue(
      "args",
      command?.schema ? formatJson(schemaSkeleton(command.schema)) : "",
    );
    form.clearErrors();
  }, [workerName, type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const set = aborts.current;

    return () => {
      for (const abort of set) abort.abort();
    };
  }, []);

  const put = (next: AgentCommandDto) =>
    setHistory(prev =>
      prev.some(c => c.id === next.id)
        ? prev.map(c => (c.id === next.id ? next : c))
        : [next, ...prev].slice(0, HISTORY_LIMIT),
    );

  useSocketRoom("agent", agent.id);
  useSocketEvent<[IAgentCommandEvent]>("agent:command", event => {
    if (event.agentId !== agent.id) return;
    setHistory(prev =>
      prev.map(c => (c.id === event.id && c.status !== "done" ? event : c)),
    );
  });

  const argsOf = (values: TWorkerCommandForm): { value: unknown } | null => {
    if (mode === "form" && fields) {
      const built = schemaFormBody(fields, values.fields);

      if ("errors" in built) {
        for (const [name, message] of Object.entries(built.errors)) {
          form.setError(`fields.${name}`, { message });
        }

        return null;
      }

      return { value: built.value };
    }
    if (!values.args.trim()) return { value: undefined };
    const parsed = parseJsonText(values.args);

    return "value" in parsed ? { value: parsed.value } : null;
  };

  const submit = async (values: TWorkerCommandForm) => {
    const args = argsOf(values);

    if (!args) return;

    const res = await api.sendAgentWorkerCommand(agent.id, values.worker, {
      type: values.type,
      ...(args.value !== undefined && { args: args.value }),
      ...(values.timeoutSec && { timeoutMs: values.timeoutSec * 1000 }),
      waitSeconds: 0,
    });

    if (!res.data) {
      if (res.error?.code === COMMAND_INVALID) {
        form.setError(mode === "json" ? "args" : "type", {
          message: invalidText(res.error),
        });
      } else {
        notifyApiError(toast, res.error);
      }

      return;
    }

    put(res.data);
    const abort = new AbortController();

    aborts.current.add(abort);
    const done = await waitAgentCommand(api, res.data, abort.signal);

    aborts.current.delete(abort);
    if (!abort.signal.aborted) put(done);
  };

  const cancel = async (target: AgentCommandDto) => {
    const res = await api.cancelAgentCommand(agent.id, target.id);

    if (res.error) notifyApiError(toast, res.error);
  };

  return {
    form,
    workers,
    commands,
    command,
    fields,
    argsMode: mode,
    setArgsMode: (next: TArgsMode) => form.setValue("argsMode", next),
    history,
    submit,
    cancel,
    clearHistory: () =>
      setHistory(prev => prev.filter(c => c.status !== "done")),
  };
};

export type WorkerCommandVM = ReturnType<typeof useWorkerCommandVM>;
