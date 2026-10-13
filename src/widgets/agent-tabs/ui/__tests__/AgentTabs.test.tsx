import { agentModule, IAgentsStore } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IMainApi, IMainSession } from "@shared/api";
import type { AgentDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { TooltipProvider } from "@shared/ui";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TAgentTab } from "../../model/tabs";
import type { IAgentTabsAccess } from "../../model/types";
import { AgentTabs } from "../AgentTabs";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

vi.mock("@tanstack/react-router", async importOriginal => ({
  ...(await importOriginal<object>()),
  Link: ({ children }: { children: ReactNode }) => <a href="#">{children}</a>,
}));

const now = Date.now();

const agent = {
  id: "a-1",
  name: "alpha",
  labels: { zone: "eu" },
  online: true,
  revoked: false,
  enrolledAt: now,
  version: "1.0.0",
  host: { hostname: "alpha", os: "linux", arch: "amd64", kernel: "6.8.0" },
  alerts: [],
  outbox: 0,
  desiredRev: 2,
  appliedRev: 2,
  metrics: {
    at: now,
    host: { cpuPercent: 10, uptimeSec: 3600 },
    workers: { echo: { done: 7 } },
  },
  workers: [
    {
      name: "echo",
      state: "running",
      version: "1.0.0",
      release: false,
      restarts: 0,
      health: { ok: true, busy: true, message: "работа 42" },
      pending: "restart",
      manifest: {
        description: "Эхо для проверки",
        configs: [
          {
            key: "settings",
            description: "Префикс ответа",
            schema: {
              type: "object",
              properties: { prefix: { type: "string" } },
            },
          },
        ],
        commands: [
          {
            type: "echo.say",
            description: "Эхо",
            schema: {
              type: "object",
              required: ["text"],
              properties: { text: { type: "string", description: "Текст" } },
            },
            result: {
              type: "object",
              properties: { text: { type: "string" } },
            },
          },
          {
            type: "echo.long",
            description: "Долгая работа",
            schema: { type: "object" },
          },
        ],
        events: [{ type: "echo.done" }],
        requests: [
          {
            type: "echo.lookup",
            description: "Префикс от сервера",
            schema: { type: "object" },
          },
        ],
      },
    },
    {
      name: "broken",
      state: "invalid",
      release: false,
      restarts: 0,
      message: "не зарегистрировался за 60 с",
    },
  ],
} as unknown as AgentDto;

const api = {
  getAgent: vi.fn(),
  getAgentMetrics: vi.fn(async () => ({ data: [] })),
  getAgentEvents: vi.fn(async () => ({
    data: {
      items: [
        {
          id: "e-1",
          agentId: "a-1",
          worker: "echo",
          type: "echo.done",
          data: { jobId: "1234567890", echo: "привет" },
          at: now,
          receivedAt: now,
        },
      ],
      nextCursor: null,
    },
  })),
  getAgentConfigs: vi.fn(async () => ({
    data: [
      {
        agentId: "a-1",
        worker: "echo",
        key: "settings",
        version: 2,
        state: "failed",
        error: { code: "CONFIG_REJECTED", message: "плохой префикс" },
        data: { prefix: "!" },
        updatedAt: now,
      },
    ],
  })),
  getAgentCommand: vi.fn(),
  sendAgentWorkerCommand: vi.fn(),
  cancelAgentCommand: vi.fn(),
};

const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
let socket: IFakeSocket;

const none: IAgentTabsAccess = {
  canManage: false,
  canConfig: false,
  canCommand: false,
  canLogs: false,
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(IMainSession.Tid).toConstantValue({ accessToken: "t" });
  iocContainer.load(agentModule);
  iocContainer.bind(IUserStore.Tid).toConstantValue(createFakeAccess());
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(IMainSession.Tid);
  iocContainer.unload(agentModule);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(ISocketTransport.Tid);
});

const renderTab = (
  value: TAgentTab,
  access: IAgentTabsAccess,
  shown: AgentDto = agent,
) =>
  render(
    <TooltipProvider>
      <AgentTabs
        agent={shown}
        access={access}
        value={value}
        onValueChange={vi.fn()}
      />
    </TooltipProvider>,
  );

describe("AgentTabs", () => {
  it("набор вкладок: «Команды» — только с правом", () => {
    const { unmount } = renderTab("overview", none);

    expect(screen.getAllByRole("tab").map(tab => tab.textContent)).toEqual([
      "Обзор",
      "Воркеры",
      "Настройки",
      "События",
      "Журнал",
    ]);
    unmount();

    renderTab("overview", { ...none, canCommand: true });
    expect(screen.getByRole("tab", { name: "Команды" })).toBeInTheDocument();
  });

  it("обзор: метрики узла и сведения, которых нет в шапке", () => {
    renderTab("overview", none);

    expect(screen.getAllByText("Процессор").length).toBeGreaterThan(0);
    expect(screen.getByText("6.8.0")).toBeInTheDocument();
    expect(screen.getByText("1 ч 0 мин")).toBeInTheDocument();
    // Имя узла и адрес — в шапке страницы, не здесь.
    expect(screen.queryByText("Имя узла")).toBeNull();
  });

  it("воркеры: причина invalid, занят и ждёт замены", () => {
    renderTab("workers", { ...none, canManage: true });

    const rows = screen.getAllByRole("row");
    const echo = rows.find(row => row.textContent?.includes("echo"))!;
    const broken = rows.find(row => row.textContent?.includes("broken"))!;

    expect(within(echo).getByText("занят")).toBeInTheDocument();
    expect(
      within(echo).getByText("перезапуск — когда освободится"),
    ).toBeInTheDocument();
    expect(
      within(echo).getByRole("button", { name: "Заменить сейчас" }),
    ).toBeVisible();
    expect(
      within(broken).getByText("не зарегистрировался за 60 с"),
    ).toBeInTheDocument();
  });

  it("воркеры: раскрытая строка — манифест и метрики", () => {
    renderTab("workers", none);

    const echo = screen
      .getAllByRole("row")
      .find(row => row.textContent?.includes("echo"))!;

    fireEvent.click(within(echo).getAllByRole("button")[0]);

    expect(screen.getByText("Эхо для проверки")).toBeInTheDocument();
    expect(screen.getByText("Команды · 2")).toBeInTheDocument();
    expect(screen.getByText("echo.say")).toBeInTheDocument();
    expect(screen.getByText("аргументы · итог")).toBeInTheDocument();
    expect(screen.getByText("echo.long")).toBeInTheDocument();
    expect(screen.getByText("Долгая работа")).toBeInTheDocument();
    expect(screen.getByText("echo.done")).toBeInTheDocument();
    expect(screen.getByText("Запросы к серверу · 1")).toBeInTheDocument();
    expect(screen.getByText("echo.lookup")).toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
  });

  it("ждущая команда замены — в строке до итога", () => {
    const free = {
      ...agent,
      workers: [{ ...agent.workers[0], pending: undefined }],
    } as AgentDto;
    const store = IAgentsStore.getInstance();

    act(() =>
      store.trackCommand({
        id: "c-1",
        agentId: "a-1",
        type: "worker.update",
        worker: "echo",
        status: "pending",
        createdAt: now,
      }),
    );
    renderTab("workers", { ...none, canManage: true }, free);

    expect(
      screen.getByText("обновление — когда освободится"),
    ).toBeInTheDocument();
    act(() => store.settleCommand("c-1"));
    expect(screen.queryByText("обновление — когда освободится")).toBeNull();
  });

  it("без связи: состояние воркеров неизвестно, без действий", () => {
    renderTab(
      "workers",
      { ...none, canManage: true },
      {
        ...agent,
        online: false,
      },
    );

    expect(screen.getByText("Агент без связи")).toBeInTheDocument();
    expect(screen.getAllByText("неизвестно").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Перезапустить" })).toBeNull();
  });

  it("настройки: ключи из манифеста, ошибка применения; удаление — с правом", async () => {
    const { unmount } = renderTab("configs", none);

    expect(await screen.findByText("Префикс ответа")).toBeInTheDocument();
    expect(
      screen.getByText("CONFIG_REJECTED: плохой префикс"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ключи появятся, когда воркер зарегистрируется у агента.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Удалить settings" }),
    ).toBeNull();
    unmount();

    renderTab("configs", { ...none, canConfig: true });
    expect(
      await screen.findByRole("button", { name: "Удалить settings" }),
    ).toBeInTheDocument();
  });

  it("команды: только из манифеста; аргументы — форма по схеме; итог — в списке", async () => {
    api.sendAgentWorkerCommand.mockResolvedValue({
      data: {
        id: "c-9",
        agentId: "a-1",
        type: "worker.command",
        worker: "echo",
        workerType: "echo.say",
        args: { worker: "echo", type: "echo.say", args: { text: "hi" } },
        status: "pending",
        createdAt: now,
      },
    });
    api.getAgentCommand.mockResolvedValue({
      data: {
        id: "c-9",
        agentId: "a-1",
        type: "worker.command",
        worker: "echo",
        workerType: "echo.say",
        status: "done",
        ok: true,
        result: { text: "HI" },
        createdAt: now,
      },
    });
    renderTab("commands", { ...none, canCommand: true });

    expect(
      screen.getByText("Итоги отправленных команд появятся здесь."),
    ).toBeInTheDocument();
    expect(screen.getByText("Схема аргументов")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^text/), {
      target: { value: "hi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() =>
      expect(api.sendAgentWorkerCommand).toHaveBeenCalledWith("a-1", "echo", {
        type: "echo.say",
        args: { text: "hi" },
        waitSeconds: 0,
      }),
    );
    expect(await screen.findByText("выполнена")).toBeInTheDocument();
    expect(screen.getByText(/"HI"/)).toBeInTheDocument();
  });

  it("события: лента со ссылкой на задачу", async () => {
    renderTab("events", none);

    expect(await screen.findByText("echo.done")).toBeInTheDocument();
    expect(screen.getByText("задача 12345678")).toBeInTheDocument();
  });

  it("журнал: записи с узла — только с правом", () => {
    const { unmount } = renderTab("logs", none);

    expect(screen.queryByText("Журнал с узла:")).toBeNull();
    unmount();

    renderTab("logs", { ...none, canLogs: true });
    expect(screen.getByText("Журнал с узла:")).toBeInTheDocument();
  });
});
