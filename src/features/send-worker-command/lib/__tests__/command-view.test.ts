import type { AgentCommandDto } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import { commandArgsOf, commandStatusView } from "../command-view";

const command = (patch: Partial<AgentCommandDto> = {}): AgentCommandDto => ({
  id: "c-1",
  agentId: "a-1",
  type: "worker.command",
  status: "pending",
  createdAt: 1,
  ...patch,
});

describe("command view", () => {
  it("статус: ждёт, выполняется, выполнена, отменена, ошибка", () => {
    expect(commandStatusView(command()).label).toBe("ждёт воркер");
    expect(commandStatusView(command({ progress: 0.3 })).label).toBe(
      "выполняется",
    );
    expect(
      commandStatusView(command({ status: "done", ok: true })).variant,
    ).toBe("success");
    expect(
      commandStatusView(
        command({
          status: "done",
          ok: false,
          error: { code: "CANCELLED", message: "" },
        }),
      ).label,
    ).toBe("отменена");
    expect(
      commandStatusView(
        command({
          status: "done",
          ok: false,
          error: { code: "X", message: "" },
        }),
      ).variant,
    ).toBe("destructive");
  });

  it("аргументы — как их получит воркер", () => {
    expect(
      commandArgsOf(
        command({ args: { worker: "echo", type: "echo.say", args: { a: 1 } } }),
      ),
    ).toEqual({ a: 1 });
    expect(commandArgsOf(command())).toBeUndefined();
  });
});
