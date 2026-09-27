import { textareaVariants } from "../textarea-variants";

describe("textareaVariants", () => {
  it("uses shared field appearance without a fixed control height", () => {
    const classes = textareaVariants({ size: "lg", variant: "error" });

    expect(classes).toContain("w-full");
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border-destructive");
    expect(classes).toContain("text-base");
    expect(classes).toContain("focus-visible:shadow-focus-error");
    expect(classes).not.toMatch(/\bh-(8|10|12)\b/);
  });
});
