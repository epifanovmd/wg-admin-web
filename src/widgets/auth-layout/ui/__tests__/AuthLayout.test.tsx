import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthLayout } from "../AuthLayout";

vi.mock("@shared/config/env", async importOriginal => ({
  ...(await importOriginal<object>()),
  APP_NAME: "Моё приложение",
}));

describe("AuthLayout", () => {
  it("название приложения — из VITE_APP_NAME, как в логотипе шапки", () => {
    render(
      <AuthLayout>
        <form />
      </AuthLayout>,
    );

    expect(screen.getAllByText(/Моё приложение/)).not.toHaveLength(0);
    expect(screen.queryByText(/React Vite App/)).toBeNull();
  });
});
