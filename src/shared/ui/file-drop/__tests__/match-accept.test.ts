import { matchesAccept } from "../match-accept";

const file = (name: string, type: string) => new File([""], name, { type });

describe("matchesAccept", () => {
  it("accepts everything without rules", () => {
    expect(matchesAccept(file("a.bin", ""), undefined)).toBe(true);
    expect(matchesAccept(file("a.bin", ""), " ")).toBe(true);
  });

  it("matches extensions, wildcard types and exact mime types", () => {
    expect(matchesAccept(file("Photo.JPG", "image/jpeg"), ".jpg")).toBe(true);
    expect(matchesAccept(file("a.pdf", "application/pdf"), "image/*")).toBe(
      false,
    );
    expect(matchesAccept(file("a.png", "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(file("a.csv", "text/csv"), ".xlsx, text/csv")).toBe(
      true,
    );
  });
});
