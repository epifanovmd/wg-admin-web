import { formatFileSize } from "../format-file-size";
import { validateFiles } from "../validate-files";

const file = (name: string, size: number, type = "") =>
  new File([new Uint8Array(size)], name, { type });

describe("validateFiles", () => {
  it("пропускает всё без ограничений", () => {
    const files = [file("a", 1), file("b", 2)];

    expect(validateFiles(files, {})).toEqual({
      accepted: files,
      rejections: [],
    });
  });

  it("maxFiles = 0 отклоняет всё по количеству", () => {
    const a = file("a", 1);

    expect(validateFiles([a], { maxFiles: 0 }).rejections).toEqual([
      { file: a, reason: "count" },
    ]);
  });
});

describe("formatFileSize", () => {
  it.each([
    [0, "0 Б"],
    [512, "512 Б"],
    [1536, "1,5 КБ"],
    [1.2 * 1024 * 1024, "1,2 МБ"],
    [3 * 1024 ** 3, "3 ГБ"],
  ])("%d → %s", (bytes, expected) => {
    expect(formatFileSize(bytes).replace(/\s/g, " ")).toBe(expected);
  });
});
