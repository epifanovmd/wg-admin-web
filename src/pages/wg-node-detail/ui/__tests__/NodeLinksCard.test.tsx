import type { IWgLinkHealth } from "@shared/api/gen/main/model";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeLinksCard } from "../NodeLinksCard";

const link = (overrides: Partial<IWgLinkHealth>): IWgLinkHealth => ({
  linkId: "l1",
  role: "target",
  counterpartNodeId: "n2",
  counterpartName: "msk",
  tunnelName: "wgt0",
  rttMs: 42.5,
  lossPercent: 0,
  status: "ok",
  ts: new Date().toISOString(),
  ...overrides,
});

describe("NodeLinksCard", () => {
  it("линк: встречная нода, роль, RTT, потери и статус", () => {
    render(
      <NodeLinksCard
        links={[
          link({}),
          link({
            linkId: "l2",
            role: "relay",
            counterpartName: "fra",
            tunnelName: "wgt1",
            rttMs: null,
            lossPercent: 100,
            status: "down",
          }),
        ]}
      />,
    );

    expect(screen.getByText("msk")).toBeTruthy();
    expect(screen.getByText("релей для этой ноды")).toBeTruthy();
    expect(screen.getByText("42.5 мс")).toBeTruthy();
    expect(screen.getByText("Работает")).toBeTruthy();
    expect(screen.getByText("fra")).toBeTruthy();
    expect(screen.getByText("эта нода — релей")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText("Не отвечает")).toBeTruthy();
  });

  it("без линков карточка не рендерится", () => {
    const { container } = render(<NodeLinksCard links={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
