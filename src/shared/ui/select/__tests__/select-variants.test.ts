import { fieldVariants } from "../../foundation/field-variants";
import {
  selectContentClasses,
  selectItemClasses,
  selectItemHighlightedClasses,
  selectSearchInputClasses,
  selectTriggerVariants,
} from "../select-variants";

describe("select variants", () => {
  it("exports stable structural classes", () => {
    expect(selectContentClasses).toContain("bg-popover");
    expect(selectItemClasses).toContain("cursor-pointer");
    expect(selectItemHighlightedClasses).toBe(
      "bg-accent text-accent-foreground",
    );
    expect(selectSearchInputClasses).toContain("cursor-text");
  });

  it("builds default and validation trigger variants", () => {
    expect(selectTriggerVariants()).toContain(
      fieldVariants({ focusMode: "within" }),
    );
    expect(selectTriggerVariants()).toContain("items-center");
    expect(selectTriggerVariants({ size: "lg" })).toContain("text-base");
    expect(selectSearchInputClasses).not.toContain("text-sm");
    expect(selectTriggerVariants({ valid: true })).toContain("border-success");
    expect(selectTriggerVariants({ valid: false })).toContain(
      "border-destructive",
    );
  });
});
