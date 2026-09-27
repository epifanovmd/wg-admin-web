import type { JobRunDto } from "@shared/api/gen/main/model";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProvisionJobBanner } from "../ProvisionJobBanner";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

const job = (patch: Partial<JobRunDto>): JobRunDto =>
  ({
    id: "j1",
    queue: "wg.provision-node",
    status: "running",
    title: "Установка агента: Альфа",
    progress: 0.4,
    progressText: "Сборка образа агента",
    logTail: ["▶ Сборка образа агента"],
    error: null,
    ...patch,
  }) as JobRunDto;

describe("ProvisionJobBanner", () => {
  it("идёт установка — прогресс и текущий шаг", () => {
    render(<ProvisionJobBanner job={job({})} nodeStatus="provisioning" />);

    expect(screen.getByText("Установка агента")).toBeTruthy();
    expect(screen.getByText("Сборка образа агента")).toBeTruthy();
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("провал — ошибка и хвост лога", () => {
    render(
      <ProvisionJobBanner
        job={job({
          status: "failed",
          error: { code: "X", message: "Запуск агента: код 125" } as any,
          logTail: ["▶ Запуск агента", "denied"],
        })}
        nodeStatus="error"
      />,
    );

    expect(screen.getByText("Установка агента не удалась")).toBeTruthy();
    expect(screen.getByText("Запуск агента: код 125")).toBeTruthy();
    expect(screen.getByText(/denied/)).toBeTruthy();
  });

  it("завершена, агент ещё не на связи — ждём; на связи — баннера нет", () => {
    const { rerender, container } = render(
      <ProvisionJobBanner
        job={job({ status: "completed", progress: 1 })}
        nodeStatus="provisioning"
      />,
    );

    expect(screen.getByText(/ждём выхода агента на связь/)).toBeTruthy();

    rerender(
      <ProvisionJobBanner
        job={job({ status: "completed", progress: 1 })}
        nodeStatus="online"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("задача завершена, нода ещё устанавливается — ждём агента", () => {
    render(
      <ProvisionJobBanner
        job={job({ status: "completed" })}
        nodeStatus="provisioning"
      />,
    );

    expect(screen.getByText(/Служба агента запущена/)).toBeTruthy();
  });
});
