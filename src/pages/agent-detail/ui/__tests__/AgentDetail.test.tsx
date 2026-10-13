import { agentModule } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { wgModule } from "@entities/wg";
import { IMainApi, IMainSession } from "@shared/api";
import type { AgentDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { TooltipProvider } from "@shared/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AgentDetail } from "../AgentDetail";

vi.mock("@tanstack/react-router", async importOriginal => ({
  ...(await importOriginal<object>()),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}));
vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const now = Date.now();

const agent: AgentDto = {
  id: "a-1",
  name: "node-01",
  labels: { zone: "eu" },
  online: true,
  revoked: false,
  remoteIp: "203.0.113.10",
  version: "1.0.0",
  enrolledAt: now - 86_400_000,
  lastSeenAt: now,
  host: { hostname: "node-01", os: "linux", arch: "amd64", kernel: "6.8.0" },
  alerts: [
    { kind: "workerUnhealthy", message: "база недоступна", worker: "kv" },
  ],
  outbox: 2,
  desiredRev: 3,
  appliedRev: 3,
  workers: [
    {
      name: "kv",
      state: "running",
      version: "1.0.0",
      release: false,
      restarts: 0,
      health: { ok: false, message: "база недоступна" },
      manifest: {
        configs: [{ key: "main", description: "Подключение к базе" }],
        commands: [{ type: "kv.get" }],
        events: [{ type: "backup.done" }],
        requests: [],
      },
    },
  ],
  metrics: {
    at: now,
    host: {
      cpuPercent: 12,
      memUsedBytes: 1024 ** 3,
      memTotalBytes: 4 * 1024 ** 3,
      load1: 0.5,
      load5: 0.4,
      load15: 0.3,
      netRxBps: 2048,
      netTxBps: 1024,
      uptimeSec: 3600,
      disks: [{ mount: "/", usedBytes: 10, totalBytes: 100 }],
      interfaces: [{ name: "eth0", rxBps: 1, txBps: 2 }],
      temperatures: { maxC: 50, sensors: [{ name: "cpu", c: 50 }] },
      gpus: [{ index: 0, name: "GPU", utilPercent: 5 }],
    },
    workers: { kv: { keys: 3, db: { size: 10 } } },
  },
};

const api = {
  listWgNodes: vi.fn(async () => ({
    data: { items: [{ id: "n-1", name: "alpha", agentId: "a-1" }], total: 1 },
  })),
  getAgent: vi.fn(async () => ({ data: agent })),
  getAgentRelease: vi.fn(async () => ({
    data: { bundle: false, workers: [] },
  })),
  getAgentMetrics: vi.fn(async () => ({
    data: [{ ...agent.metrics, at: now - 1000 }],
  })),
  getAgentConfigs: vi.fn(async () => ({ data: [] })),
  getAgentEvents: vi.fn(async () => ({
    data: {
      items: [
        {
          id: "e-1",
          agentId: "a-1",
          worker: "kv",
          type: "backup.done",
          data: { size: 1 },
          at: now,
          receivedAt: now,
        },
      ],
      nextCursor: null,
    },
  })),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(IMainSession.Tid).toConstantValue({ accessToken: "t" });
  iocContainer.load(agentModule, wgModule);
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions: ["*"] }));
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ warning: vi.fn(), error: vi.fn(), info: vi.fn() });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(IMainSession.Tid);
  iocContainer.unload(agentModule, wgModule);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(ISocketTransport.Tid);
});

const openTab = (name: string) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0 });

describe("AgentDetail", () => {
  it("шапка, проблемы и все вкладки отрисовываются", async () => {
    render(
      <TooltipProvider>
        <AgentDetail agentId="a-1" />
      </TooltipProvider>,
    );

    const heading = await screen.findByRole("heading", {
      level: 1,
      name: /node-01/,
    });

    expect(heading).toHaveTextContent("на связи");
    expect(heading).toHaveTextContent("воркеров не в порядке: 1");
    expect(await screen.findByText("Проблемы · 1")).toBeInTheDocument();
    expect(screen.getByText("воркер не в порядке")).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /Нода alpha/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сменить ключ" })).toBeVisible();

    openTab("Воркеры");
    expect(await screen.findByText("kv")).toBeInTheDocument();
    expect(screen.getAllByText("база недоступна").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Перезапустить" })).toBeVisible();

    openTab("Настройки");
    expect(await screen.findByText("Подключение к базе")).toBeInTheDocument();
    expect(screen.getByText("не задан")).toBeInTheDocument();

    openTab("Команды");
    expect(
      await screen.findByText("Итоги отправленных команд появятся здесь."),
    ).toBeInTheDocument();

    openTab("События");
    expect(await screen.findByText("backup.done")).toBeInTheDocument();

    openTab("Журнал");
    expect(
      await screen.findByText("Записей пока нет — новые появятся здесь"),
    ).toBeInTheDocument();
    expect(screen.getByText("Журнал с узла:")).toBeInTheDocument();
  });
});
