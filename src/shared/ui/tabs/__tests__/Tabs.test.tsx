import { render, screen } from "@testing-library/react";

import { Tabs } from "../Tabs";
import { TabsList } from "../TabsList";
import { TabsTrigger } from "../TabsTrigger";

describe("Tabs", () => {
  it("renders the list even when there is a single tab", () => {
    render(
      <Tabs defaultValue="only">
        <TabsList>
          <TabsTrigger value="only">Единственная</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Единственная" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
