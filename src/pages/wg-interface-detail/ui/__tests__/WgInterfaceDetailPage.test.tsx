import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { act, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WgInterfaceDetailPage } from "../WgInterfaceDetailPage";

// Observable: смена параметра перерисовывает observer-страницу, как роутер.
const params = observable({ interfaceId: "i1" });

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
  useParams: () => params,
}));

const iface = {
  id: "i1",
  nodeId: "n1",
  nodeName: "Альфа",
  name: "wg-alpha",
  status: "up",
  statusMessage: null,
  enabled: true,
  addressCidr: "10.8.0.1/24",
  addressV6Cidr: null,
  listenPort: 51820,
  dns: null,
  mtu: null,
  natEnabled: true,
  clientEndpoint: null,
  endpointId: null,
  publicKey: "key",
  replicas: [],
} as unknown as WgInterfaceDto;

/** Незаданные методы API отвечают пустыми данными. */
const createApi = (overrides: Record<string, unknown>) =>
  new Proxy(overrides, {
    get: (target, key: string) =>
      key === "then"
        ? undefined
        : (target[key] ?? vi.fn().mockResolvedValue({ data: null })),
  });

beforeEach(() => {
  runInAction(() => {
    params.interfaceId = "i1";
  });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue(
    createApi({
      // Второй интерфейс ещё грузится.
      getWgInterface: (id: string) =>
        id === "i1"
          ? Promise.resolve({ data: iface })
          : new Promise(() => undefined),
      listWgPeers: () => Promise.resolve({ data: { items: [], total: 0 } }),
    }),
  );
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue(
    createFakeAccess({
      permissions: [WG_PERMISSIONS.INTERFACE_VIEW, WG_PERMISSIONS.PEER_VIEW],
    }),
  );
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
});

describe("WgInterfaceDetailPage", () => {
  it("пока грузится другой интерфейс, прежний не показывается", async () => {
    render(
      <TooltipProvider>
        <ModalProvider>
          <WgInterfaceDetailPage />
        </ModalProvider>
      </TooltipProvider>,
    );

    await screen.findByText("wg-alpha");

    act(() => {
      runInAction(() => {
        params.interfaceId = "i2";
      });
    });

    expect(screen.queryByText("wg-alpha")).toBeNull();
    expect(screen.getByText("Загрузка интерфейса…")).toBeTruthy();
  });

  it("копий нет — пояснение вместо списка из одной основной", async () => {
    render(
      <TooltipProvider>
        <ModalProvider>
          <WgInterfaceDetailPage />
        </ModalProvider>
      </TooltipProvider>,
    );

    expect(
      await screen.findByText(/Копий нет — интерфейс работает только на/),
    ).toBeTruthy();
    expect(screen.queryByText("основная")).toBeNull();
    // Без права на реплики — без кнопки.
    expect(screen.queryByRole("button", { name: "Сделать копию" })).toBeNull();
  });
});
