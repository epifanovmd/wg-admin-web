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

const manifest = (configs: string[]) => ({
  version: "1.0.0",
  configs: configs.map(key => ({ key })),
  routes: [],
  events: [],
  jobs: [],
  requests: [],
});

const agent = {
  id: AGENT_ID,
  name: "Гамма",
  labels: {},
  online: true,
  revoked: false,
  enrolledAt: 1,
  version: "1.0.1",
  host: { os: "linux", arch: "amd64", hostname: "example-host" },
  workers: [
    {
      name: "wg",
      state: "running",
      version: "1.0.0",
      release: true,
      health: { ok: true },
      manifest: manifest(["state", "probes"]),
    },
    {
      name: "socks",
      state: "invalid",
      message: "нет ответа на GET /health",
      release: true,
    },
    { name: "sysmetrics", state: "running", builtin: true },
  ],
  alerts: [],
};

const configs = [
  {
    worker: "wg",
    key: "state",
    status: {
      agentId: AGENT_ID,
      worker: "wg",
      key: "state",
      version: 3,
      applied: 3,
      state: "applied",
      result: {
        version: 3,
        appliedAt: 1,
        interfaces: [{ name: "wg0", status: "up" }],
      },
    },
  },
];

const release = {
  manifest: { version: "1.0.1", artifacts: [] },
  candidates: [],
  workerCandidates: [{ agentId: AGENT_ID, worker: "wg", target: "1.1.0" }],
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

const wgNodeLogs = vi.fn();
const restartWgNodeWorker = vi.fn();

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
  wgNodeLogs.mockReset().mockResolvedValue({
    data: {
      content: "",
      entries: [{ at: 1, level: "info", source: "wg", msg: "строка журнала" }],
    },
  });
  restartWgNodeWorker
    .mockReset()
    .mockResolvedValue({ data: { deferred: false } });
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
      wgNodeLogs,
      restartWgNodeWorker,
      getAgent: () => Promise.resolve({ data: agent }),
      getAgentConfigs: () => Promise.resolve({ data: configs }),
      getAgentRelease: () => Promise.resolve({ data: release }),
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
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
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

  it("вкладка «Агент»: связь, воркеры и итог применения настроек", async () => {
    await openAgentNode();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));

    expect(await screen.findByText("на связи")).toBeTruthy();
    expect(screen.getByText("example-host")).toBeTruthy();
    expect(screen.getAllByText("работает").length).toBeGreaterThan(0);
    expect(screen.getByText("не зарегистрирован")).toBeTruthy();
    expect(await screen.findByText("wg0")).toBeTruthy();
    expect(screen.getByText("применено")).toBeTruthy();
    // Ключ из манифеста без значения на сервере.
    expect(screen.getByText("не задан")).toBeTruthy();
    // Без права на агента действий с воркерами нет.
    expect(
      screen.queryByRole("button", { name: "Перезапустить воркер wg" }),
    ).toBeNull();
  });

  it("перезапуск и обновление воркера — через ноду, с правом на агента", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_AGENT];
    await openAgentNode();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));

    expect(
      await screen.findByRole("button", { name: "Обновить воркер wg" }),
    ).toBeTruthy();
    // Встроенный воркер — часть агента: его не перезапускают.
    expect(
      screen.queryByRole("button", { name: "Перезапустить воркер sysmetrics" }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Перезапустить воркер wg" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Перезапустить" }),
    );

    await waitFor(() =>
      expect(restartWgNodeWorker).toHaveBeenCalledWith("n3", "wg", {
        force: false,
      }),
    );
  });

  it("журнал с узла — агента по умолчанию, с правом на журнал", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_LOGS];
    await openAgentNode();
    fireEvent.mouseDown(await screen.findByRole("tab", { name: "Журнал" }));
    fireEvent.click(screen.getByRole("button", { name: "Загрузить" }));

    expect(await screen.findByText(/\[wg\] строка журнала/)).toBeTruthy();
    expect(wgNodeLogs).toHaveBeenCalledWith("n3", { lines: 300 });
  });

  it("нода без агента: «Агент не установлен», событий и журнала нет", async () => {
    permissions = [WG_PERMISSIONS.NODE_VIEW, WG_PERMISSIONS.NODE_LOGS];
    render(page());
    await screen.findByText("Альфа");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Агент" }));

    expect(await screen.findByText("Агент не установлен")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Журнал" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "События" })).toBeNull();
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
