import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { IWgMeshMatrix } from "@shared/api/gen/main/model";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeMeshCard } from "../NodeMeshCard";

const ts = new Date().toISOString();
const matrix: IWgMeshMatrix = {
  nodes: [
    { id: "a", name: "Альфа" },
    { id: "b", name: "msk" },
    { id: "c", name: "fra" },
  ],
  cells: [
    {
      fromNodeId: "b",
      toNodeId: "a",
      rttMs: 61.2,
      lossPercent: 0,
      samples: 5,
      ts,
    },
    {
      fromNodeId: "c",
      toNodeId: "a",
      rttMs: 95,
      lossPercent: 0,
      samples: 5,
      ts,
    },
    {
      fromNodeId: "a",
      toNodeId: "c",
      rttMs: null,
      lossPercent: 100,
      samples: 5,
      ts,
    },
  ],
};

describe("NodeMeshCard", () => {
  it("ячейки RTT, потери и лучший релей для ноды", () => {
    render(
      <TooltipProvider>
        <NodeMeshCard matrix={matrix} />
      </TooltipProvider>,
    );

    const best = screen.getByText("61.2");

    expect(best.closest("[data-best]")).toBeTruthy();
    expect(screen.getByText("95").closest("[data-best]")).toBeNull();
    expect(screen.getByText("×")).toBeTruthy();

    const table = screen.getByRole("table");

    expect(within(table).getAllByText("Альфа").length).toBeGreaterThan(0);
  });

  it("ячейка без свежих проб приглушена и не считается лучшим путём", () => {
    const old = new Date(Date.now() - 10 * 60_000).toISOString();

    render(
      <TooltipProvider>
        <NodeMeshCard
          matrix={{
            nodes: matrix.nodes,
            cells: [
              {
                fromNodeId: "b",
                toNodeId: "a",
                rttMs: 40,
                lossPercent: 0,
                samples: 5,
                ts: old,
              },
              {
                fromNodeId: "c",
                toNodeId: "a",
                rttMs: 95,
                lossPercent: 0,
                samples: 5,
                ts,
              },
            ],
          }}
        />
      </TooltipProvider>,
    );

    const stale = screen.getByText("40").closest("td");

    expect(stale?.hasAttribute("data-stale")).toBe(true);
    expect(stale?.hasAttribute("data-best")).toBe(false);
    expect(screen.getByText("95").closest("[data-best]")).toBeTruthy();
  });

  it("меньше двух нод — карточка не рендерится", () => {
    const { container } = render(
      <NodeMeshCard matrix={{ nodes: [{ id: "a", name: "A" }], cells: [] }} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
