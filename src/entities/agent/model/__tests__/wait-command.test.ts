import type { AgentCommandDto } from "@shared/api/gen/main/model";
import { describe, expect, it, vi } from "vitest";

import { waitAgentCommand } from "../wait-command";

const command = (patch: Partial<AgentCommandDto> = {}): AgentCommandDto => ({
  id: "c-1",
  agentId: "a-1",
  type: "worker.restart",
  status: "pending",
  createdAt: 1,
  ...patch,
});

describe("waitAgentCommand", () => {
  it("длинные запросы итога, пока команда не завершится", async () => {
    const getAgentCommand = vi
      .fn()
      .mockResolvedValueOnce({ data: command({ progress: 0.5 }) })
      .mockResolvedValueOnce({ data: command({ status: "done", ok: true }) });

    const done = await waitAgentCommand({ getAgentCommand }, command());

    expect(done).toMatchObject({ status: "done", ok: true });
    expect(getAgentCommand).toHaveBeenCalledTimes(2);
    expect(getAgentCommand).toHaveBeenCalledWith(
      "a-1",
      "c-1",
      { waitSeconds: 25 },
      expect.objectContaining({ timeout: 35_000 }),
    );
  });

  it("сбой связи — повтор после паузы", async () => {
    vi.useFakeTimers();
    const getAgentCommand = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "нет сети" } })
      .mockResolvedValueOnce({ data: command({ status: "done", ok: false }) });
    const waiting = waitAgentCommand({ getAgentCommand }, command());

    await vi.advanceTimersByTimeAsync(2_000);

    expect((await waiting).status).toBe("done");
    vi.useRealTimers();
  });

  it("завершённая сразу — без запросов; отмена — последнее известное", async () => {
    const getAgentCommand = vi.fn();
    const finished = command({ status: "done" });

    expect(await waitAgentCommand({ getAgentCommand }, finished)).toBe(
      finished,
    );

    const abort = new AbortController();

    abort.abort();
    expect(
      (await waitAgentCommand({ getAgentCommand }, command(), abort.signal))
        .status,
    ).toBe("pending");
    expect(getAgentCommand).not.toHaveBeenCalled();
  });
});
