import { agentModule } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { AgentDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { TooltipProvider } from "@shared/ui";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AgentsPage } from "../AgentsPage";

vi.mock("@tanstack/react-router", async importOriginal => ({
  ...(await importOriginal<object>()),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}));
vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const agent = (patch: Partial<AgentDto>): AgentDto => ({
  id: "a-1",
  name: "node-01",
  labels: { zone: "eu" },
  online: true,
  revoked: false,
  enrolledAt: 1,
  version: "1.1.0",
  updateAvailable: "1.2.0",
  desiredRev: 1,
  host: { hostname: "node-01", os: "linux", arch: "amd64" },
  workers: [
    {
      name: "kv",
      state: "running",
      health: { ok: true },
      release: false,
      restarts: 0,
    },
    { name: "db", state: "backoff", release: false, restarts: 2 },
  ],
  alerts: [{ kind: "workerDown", message: "упал", worker: "db" }],
  metrics: {
    at: 1,
    host: { cpuPercent: 33, memUsedBytes: 1, memTotalBytes: 4 },
  },
  ...patch,
});

const api = {
  getAgents: vi.fn(async () => ({
    data: {
      items: [
        agent({}),
        agent({
          id: "a-2",
          name: "node-02",
          online: false,
          revoked: true,
          updateAvailable: undefined,
          alerts: [],
        }),
      ],
      total: 2,
    },
  })),
  getAgentRelease: vi.fn(async () => ({
    data: { bundle: true, workers: [] },
  })),
  getAgentEnrollmentTokens: vi.fn(async () => ({
    data: { items: [], total: 0 },
  })),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.load(agentModule);
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
  iocContainer.unload(agentModule);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(ISocketTransport.Tid);
});

describe("AgentsPage", () => {
  it("агент нашёл новую версию — значок обновления и кнопка", async () => {
    render(
      <TooltipProvider>
        <AgentsPage />
      </TooltipProvider>,
    );

    const online = (await screen.findAllByText("node-01"))
      .map(element => element.closest("tr"))
      .find(Boolean)!;

    expect(
      within(online).getByLabelText("Доступна версия 1.2.0"),
    ).toBeInTheDocument();
    expect(
      within(online).getByRole("button", { name: "Обновить агента" }),
    ).toBeInTheDocument();
  });

  it("строки агентов со статусом, обновлением и действиями", async () => {
    render(
      <TooltipProvider>
        <AgentsPage />
      </TooltipProvider>,
    );

    const online = (await screen.findAllByText("node-01"))
      .map(element => element.closest("tr"))
      .find(Boolean)!;
    const revoked = screen.getByText("node-02").closest("tr")!;

    expect(within(online).getByText("на связи")).toBeInTheDocument();
    expect(within(online).getByText("сейчас")).toBeInTheDocument();
    expect(within(online).getByText("проблем: 1")).toBeInTheDocument();
    expect(within(online).getByText("CPU 33%")).toBeInTheDocument();
    expect(
      await within(online).findByLabelText("Доступна версия 1.2.0"),
    ).toBeInTheDocument();
    expect(within(online).getByText("не в порядке: 1")).toBeInTheDocument();
    expect(
      within(online).getByRole("button", { name: "Сменить ключ" }),
    ).toBeInTheDocument();
    expect(
      within(online).getByRole("button", { name: "Удалить" }),
    ).toBeInTheDocument();

    expect(within(revoked).getByText("отозван")).toBeInTheDocument();
    expect(
      within(revoked).getByRole("button", { name: "Удалить" }),
    ).toBeInTheDocument();
  });

  it("окно установки: токены и команда", async () => {
    render(
      <TooltipProvider>
        <AgentsPage />
      </TooltipProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Установить агента" }));

    expect(await screen.findByText("1. Токен регистрации")).toBeInTheDocument();
    expect(screen.getByText("2. Команда установки")).toBeInTheDocument();
    expect(
      await screen.findByText("Токенов пока нет — создайте первый."),
    ).toBeInTheDocument();
  });
});
