import type { AgentCommandDto } from "@shared/api/gen/main/model";

/** Вид итога команды: подпись и окраска бейджа. */
export interface ICommandStatusView {
  label: string;
  variant: "success" | "destructive" | "info" | "muted";
}

/** Команда идёт, выполнена, отменена или не выполнена. */
export const commandStatusView = (
  command: AgentCommandDto,
): ICommandStatusView => {
  if (command.status !== "done") {
    return command.progress
      ? { label: "выполняется", variant: "info" }
      : { label: "ждёт воркер", variant: "muted" };
  }
  if (command.ok) return { label: "выполнена", variant: "success" };
  if (command.error?.code === "CANCELLED") {
    return { label: "отменена", variant: "muted" };
  }

  return { label: "ошибка", variant: "destructive" };
};

/** Аргументы команды воркеру — как их получит воркер (без служебной обёртки). */
export const commandArgsOf = (command: AgentCommandDto): unknown =>
  (command.args as { args?: unknown } | null | undefined)?.args;
