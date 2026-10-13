import { TooltipProvider } from "@shared/ui";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AgentStatusBadge } from "../AgentStatusBadge";

afterEach(() => {
  vi.useRealTimers();
});

const renderBadge = (agent: Parameters<typeof AgentStatusBadge>[0]["agent"]) =>
  render(
    <TooltipProvider>
      <AgentStatusBadge agent={agent} />
    </TooltipProvider>,
  );

describe("AgentStatusBadge", () => {
  it("на связи, отозван; без связи — сколько прошло с последней связи", () => {
    vi.useFakeTimers();
    vi.setSystemTime(100_000);

    renderBadge({ online: true, revoked: false });
    expect(screen.getByText("на связи")).toBeInTheDocument();

    renderBadge({ online: false, revoked: true, lastSeenAt: 90_000 });
    expect(screen.getByText("отозван")).toBeInTheDocument();

    renderBadge({ online: false, revoked: false, lastSeenAt: 96_000 });
    expect(screen.getByText("нет связи · 4 с назад")).toBeInTheDocument();

    renderBadge({ online: false, revoked: false });
    expect(screen.getByText("нет связи")).toBeInTheDocument();
  });
});
