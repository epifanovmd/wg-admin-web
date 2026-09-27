import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { act, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WgPeerDetailPage } from "../WgPeerDetailPage";

// Observable: смена параметра перерисовывает observer-страницу, как роутер.
const params = observable({ peerId: "p1" });

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useParams: () => params,
}));

const peer = {
  id: "p1",
  name: "Ноутбук",
  interfaceId: "i1",
  interfaceName: "wg0",
  nodeName: "Альфа",
  addressV4: "10.8.0.2",
  addressV6: null,
  enabled: true,
  isOnline: false,
  hasPrivateKey: true,
  hasPresharedKey: true,
  publicKey: "key",
  clientAllowedIPs: "0.0.0.0/0",
  clientDns: null,
  persistentKeepalive: 25,
  rxBytesTotal: 0,
  txBytesTotal: 0,
  lastHandshakeAt: null,
  lastEndpoint: null,
  expiresAt: null,
  disabledReason: null,
  description: null,
} as unknown as WgPeerDto;

const PEERS: Record<string, WgPeerDto> = {
  p1: peer,
  p2: { ...peer, id: "p2", name: "Телефон" },
};

const live = {
  peerId: "p1",
  ts: new Date().toISOString(),
  rxBps: 5 * 1024 * 1024,
  txBps: 0,
  online: true,
  lastHandshakeAt: null,
  endpoint: null,
  rxTotal: 0,
  txTotal: 0,
};

const bind = (permissions: string[]) => {
  runInAction(() => {
    params.peerId = "p1";
  });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue({
    getWgPeer: (id: string) => Promise.resolve({ data: PEERS[id] }),
    wgStatsSeries: vi.fn().mockResolvedValue({ data: [] }),
    wgStatsCurrentPeer: (id: string) =>
      Promise.resolve({ data: id === "p1" ? live : null }),
    wgStatsPeerWindow: vi.fn().mockResolvedValue({ data: [] }),
  });
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "u1" },
    can: (permission: string) => permissions.includes(permission),
  });
};

const renderPage = () =>
  render(
    <TooltipProvider>
      <ModalProvider>
        <WgPeerDetailPage />
      </ModalProvider>
    </TooltipProvider>,
  );

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
});

describe("WgPeerDetailPage", () => {
  it("владелец пира не видит «Изменить»", async () => {
    bind([WG_PERMISSIONS.PEER_OWN]);
    renderPage();

    await screen.findByText("Ноутбук");
    expect(screen.queryByRole("button", { name: "Изменить" })).toBeNull();
  });

  it("с правом управления пирами «Изменить» есть", async () => {
    bind([WG_PERMISSIONS.PEER_VIEW, WG_PERMISSIONS.PEER_MANAGE]);
    renderPage();

    expect(
      await screen.findByRole("button", { name: "Изменить" }),
    ).toBeTruthy();
  });

  it("при переходе на другой пир не показывает скорость прежнего", async () => {
    bind([WG_PERMISSIONS.PEER_VIEW]);
    renderPage();

    expect(await screen.findByText(/5\.0 МБ\/с/)).toBeTruthy();

    act(() => {
      runInAction(() => {
        params.peerId = "p2";
      });
    });

    await screen.findByText("Телефон");
    expect(screen.queryByText(/5\.0 МБ\/с/)).toBeNull();
  });
});
