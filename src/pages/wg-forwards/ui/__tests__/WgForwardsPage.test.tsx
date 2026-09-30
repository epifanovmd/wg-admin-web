import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WgForwardsPage } from "../WgForwardsPage";

vi.mock("@tanstack/react-router", async importOriginal => ({
  ...(await importOriginal<object>()),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

const relayed = {
  id: "i1",
  name: "wg0",
  nodeId: "a",
  nodeName: "Нидерланды",
  nodeStatus: "online",
  listenPort: 51820,
  endpointPort: null,
  endpointId: "e1",
  endpoint: {
    name: "msk-relay",
    mode: "relay",
    relayNodeId: "r",
    relayNodeName: "MSK",
  },
  status: "up",
  statusMessage: null,
  enabled: true,
  replicas: [
    {
      nodeId: "c",
      nodeName: "Алматы",
      nodeStatus: "online",
      priority: 1,
      status: "up",
      statusMessage: null,
    },
  ],
  activeReplicaNodeId: null,
  servingNodeId: "a",
};
const listWgInterfaces = vi.fn();

const bind = (permissions: string[]) => {
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  listWgInterfaces
    .mockReset()
    .mockResolvedValue({ data: { items: [relayed] } });
  iocContainer.bind(IMainApi.Tid).toConstantValue({
    listWgForwards: vi.fn().mockResolvedValue({ data: { items: [] } }),
    listWgInterfaces,
  });
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ userId: "u1", permissions }));
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({
    nodes: [],
    load: vi.fn().mockResolvedValue(undefined),
    byId: () => undefined,
    options: vi.fn().mockResolvedValue([]),
  });
};

const renderPage = () =>
  render(
    <TooltipProvider>
      <ModalProvider>
        <WgForwardsPage />
      </ModalProvider>
    </TooltipProvider>,
  );

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
});

describe("WgForwardsPage", () => {
  it("без права управления нет кнопки «Новый проброс»", () => {
    bind([WG_PERMISSIONS.FORWARD_VIEW]);
    renderPage();

    expect(screen.queryByRole("button", { name: "Новый проброс" })).toBeNull();
  });

  it("с правом создания кнопка «Новый проброс» есть", () => {
    bind([WG_PERMISSIONS.FORWARD_VIEW, WG_PERMISSIONS.FORWARD_CREATE]);
    renderPage();

    expect(screen.getByRole("button", { name: "Новый проброс" })).toBeTruthy();
  });

  it("точки через релей: релей, порт, копии и выбор копии", async () => {
    bind([
      WG_PERMISSIONS.FORWARD_VIEW,
      WG_PERMISSIONS.INTERFACE_VIEW,
      WG_PERMISSIONS.INTERFACE_REPLICAS,
    ]);
    renderPage();

    expect(await screen.findByText("MSK")).toBeTruthy();
    expect(listWgInterfaces).toHaveBeenCalledWith({
      viaRelay: true,
      limit: 100,
    });
    expect(screen.getByText("udp/51820")).toBeTruthy();
    expect(screen.getByText("Алматы")).toBeTruthy();
    expect(screen.getByLabelText("Трафик через копию")).toBeTruthy();
    expect(screen.getByLabelText("Трафик идёт через Нидерланды")).toBeTruthy();
  });

  it("без права на интерфейсы блока точек нет и запроса нет", () => {
    bind([WG_PERMISSIONS.FORWARD_VIEW]);
    renderPage();

    expect(screen.queryByText("Точки подключения через релей")).toBeNull();
    expect(listWgInterfaces).not.toHaveBeenCalled();
  });
});
