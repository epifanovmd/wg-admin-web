import { iocContainer } from "@shared/lib/di";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IUserStore } from "../../model/types";
import { PermissionGate } from "../PermissionGate";

const bind = (permissions: string[]) =>
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "u1" },
    can: (permission: string) => permissions.includes(permission),
  });

afterEach(() => iocContainer.unbind(IUserStore.Tid));

describe("PermissionGate", () => {
  it("со списком прав пускает по любому из них", () => {
    bind(["b"]);
    render(<PermissionGate permission={["a", "b"]}>содержимое</PermissionGate>);

    expect(screen.getByText("содержимое")).toBeTruthy();
  });

  it("без права — заглушка «Нет доступа»", () => {
    bind([]);
    render(<PermissionGate permission="a">содержимое</PermissionGate>);

    expect(screen.queryByText("содержимое")).toBeNull();
    expect(screen.getByText("Нет доступа")).toBeTruthy();
  });
});
