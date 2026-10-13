import { agentModule } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { JobRunDto, WgNodeDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WgNodeDetailPage } from "../WgNodeDetailPage";

// Observable: смена параметра перерисовывает observer-страницу, как роутер.
const params = observable({ nodeId: "n1" });
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
let socket = createFakeSocket();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => navigate,
  useParams: () => params,
}));

const node = (id: string, name: string) =>
  ({
    id,
    name,
    publicHost: null,
    status: "provisioning",
    statusMessage: null,
    agentId: null,
    agentVersion: null,
    applyError: null,
    osInfo: null,
  }) as unknown as WgNodeDto;

const AGENT_ID = "a".repeat(32);

const NODES: Record<string, WgNodeDto> = {
  n1: node("n1", "Альфа"),
  n2: node("n2", "Бета"),
  n3: { ...node("n3", "Гамма"), status: "online", agentId: AGENT_ID },
};

const agent = {
  id: AGENT_ID,
  name: "Гамма",
  labels: {},
  online: true,
  revoked: false,
  enrolledAt: 1,
  lastSeenAt: Date.now(),
  version: "1.0.0",
  host: { os: "linux", arch: "amd64", hostname: "example-host" },
  desiredRev: 1,
  workers: [
    {
      name: "wg",
      state: "running",
      version: "2.0.0",
      release: true,
      restarts: 0,
      health: { ok: true },
      manifest: { configs: [{ key: "state" }, { key: "probes" }] },
    },
    {
      name: "socks",
      state: "invalid",
      message: "нет регистрации",
      release: true,
      restarts: 0,
    },
  ],
  alerts: [],
};

const job = {
  id: "j1",
  status: "running",
  progress: 0.4,
  progressText: "Установка службы агента",
  logTail: [],
  error: null,
} as unknown as JobRunDto;

const live = {
  nodeId: "n1",
  ts: new Date().toISOString(),
  rxBps: 5 * 1024 * 1024,
  txBps: 0,
  rxTotal: 0,
  txTotal: 0,
  peersOnline: 0,
  peersTotal: 0,
};

const getAgentLogs = vi.fn();

/** Незаданные методы API отвечают пустыми данными. */
const createApi = (overrides: Record<string, unknown>) =>
  new Proxy(overrides, {
    get: (target, key: string) =>
      key === "then"
        ? undefined
        : (target[key] ?? vi.fn().mockResolvedValue({ data: null })),
  });

let permissions: string[] = [];

beforeEach(() => {
  permissions = [WG_PERMISSIONS.NODE_VIEW];
  getAgentLogs.mockReset().mockResolvedValue({
    data: {
      entries: [{ at: 1, level: "info", source: "wg", msg: "строка журнала" }],
    },
  });
  runInAction(() => {
    params.nodeId = "n1";
  });
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(
    createApi({
      getWgNode: (id: string) => Promise.resolve({ data: NODES[id] }),
      listWgInterfaces: () =>
        Promise.resolve({ data: { items: [], total: 0 } }),
      // Ответы по второй ноде не приходят: видно, что осталось от первой.
      listJobs: ({ scopeId }: { scopeId: string }) =>
        scopeId === "n1"
          ? Promise.resolve({ data: { items: [job], total: 1 } })
          : new Promise(() => undefined),
      getAgentLogs,
      getAgent: () => Promise.resolve({ data: agent }),
      getAgentConfigs: () => Promise.resolve({ data: [] }),
      getAgentMetrics: () => Promise.resolve({ data: [] }),
      getAgentEvents: () =>
        Promise.resolve({ data: { items: [], nextCursor: null } }),
      wgStatsCurrentNode: (id: string) =>
        Promise.resolve({ data: id === "n1" ? live : null }),
      wgStatsNodeWindow: () => Promise.resolve({ data: [] }),
    }),
  );
  iocContainer.bind(INotificationService.Tid).toConstantValue({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  });
  // Права читаются при рендере: тест задаёт их после beforeEach.
  iocContainer
    .bind(IUserStore.Tid)
    .toDynamicValue(() => createFakeAccess({ userId: "u1", permissions }));
  iocContainer
    .bind(IWgNodesStore.Tid)
    .toConstantValue({ options: vi.fn().mockResolvedValue([]) });
  iocContainer.load(agentModule);
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
  iocContainer.unload(agentModule);
  navigate.mockClear();
});

const page = () => (
  <TooltipProvider>
    <ModalProvider>
      <WgNodeDetailPage />
    </ModalProvider>
  </TooltipProvider>
);

describe("WgNodeDetailPage", () => {
  it("при переходе на другую ноду не показывает данные прежней", async () => {
    render(page());

    await screen.findByText("Альфа");
    expect(await screen.findByText("Установка службы агента")).toBeTruthy();
    expect(await screen.findByText(/5\.0 МБ\/с/)).toBeTruthy();

    act(() => {
      runInAction(() => {
        params.nodeId = "n2";
      });
    });

    await screen.findByText("Бета");
    expect(screen.queryByText("Установка службы агента")).toBeNull();
    expect(screen.queryByText(/5\.0 МБ\/с/)).toBeNull();
  });

  const openAgentNode = async () => {
    runInAction(() => {
      params.nodeId = "n3";
    });
    render(page());
    await screen.findByText("Гамма");
  };

  it("вкладка «Агент»: вкладки агента, воркеры; без права на агента — без команд и действий", async () => {
    await openAgentNode();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Воркеры" }));

    expect(await screen.findByText("wg")).toBeTruthy();
    expect(screen.getByText("socks")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Настройки" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Журнал" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Команды" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Сменить ключ" })).toBeNull();
  });

  it("с правом на агента ноды — команды воркерам и смена ключа", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_AGENT];
    await openAgentNode();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));

    expect(await screen.findByRole("tab", { name: "Команды" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Сменить ключ" })).toBeTruthy();
  });

  it("журнал с узла — запрос к агенту ноды, с правом на журнал", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_LOGS];
    await openAgentNode();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Журнал" }));
    fireEvent.click(await screen.findByRole("button", { name: "Загрузить" }));

    await waitFor(() =>
      expect(getAgentLogs).toHaveBeenCalledWith(
        AGENT_ID,
        expect.objectContaining({ lines: expect.any(Number) }),
      ),
    );
  });

  it("нода без агента: «Агент не установлен», вкладок агента нет", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_LOGS];
    render(page());
    await screen.findByText("Альфа");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));

    expect(await screen.findByText("Агент не установлен")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Журнал" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Воркеры" })).toBeNull();
  });

  it("нода удалена — уход к списку нод", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW];
    render(page());
    await screen.findByText("Альфа");

    act(() => socket.fire("wg:node:deleted", { id: "n1" }));

    expect(navigate).toHaveBeenCalledWith({ to: "/wg/nodes" });
  });

  it("без права на интерфейсы вкладки «Интерфейсы» нет, список не грузится", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW];
    render(page());
    await screen.findByText("Альфа");

    expect(screen.queryByRole("tab", { name: "Интерфейсы" })).toBeNull();
  });
});
