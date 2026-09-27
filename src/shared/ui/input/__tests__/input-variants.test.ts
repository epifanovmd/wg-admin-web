import { fieldVariants } from "../../foundation/field-variants";
import { inputVariants } from "../input-variants";

describe("inputVariants", () => {
  it("builds default, sized and semantic variants", () => {
    expect(inputVariants()).toContain(fieldVariants({ focusMode: "open" }));
    expect(inputVariants()).toContain("data-[state=open]:shadow-focus");
    expect(inputVariants({ size: "sm" })).toContain("text-sm");
    expect(inputVariants({ variant: "filled" })).toContain("bg-muted");
    expect(inputVariants({ variant: "error" })).toContain("border-destructive");
    expect(inputVariants({ variant: "success" })).toContain("border-success");
  });
});
