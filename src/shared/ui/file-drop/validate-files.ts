import { matchesAccept } from "./match-accept";

export type FileRejectionReason = "type" | "size" | "count";

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface ValidateFilesOptions {
  accept?: string;
  /** Максимальный размер одного файла, байт. */
  maxSize?: number;
  /** Сколько файлов принять за раз; лишние отклоняются с причиной `count`. */
  maxFiles?: number;
}

export interface ValidateFilesResult {
  accepted: File[];
  rejections: FileRejection[];
}

const rejectReason = (
  file: File,
  { accept, maxSize }: ValidateFilesOptions,
): FileRejectionReason | null => {
  if (!matchesAccept(file, accept)) return "type";
  if (maxSize !== undefined && file.size > maxSize) return "size";

  return null;
};

/** Делит файлы на принятые и отклонённые: тип → размер → количество. */
export const validateFiles = (
  files: File[],
  options: ValidateFilesOptions,
): ValidateFilesResult => {
  const valid: File[] = [];
  const rejections: FileRejection[] = [];

  for (const file of files) {
    const reason = rejectReason(file, options);

    if (reason) rejections.push({ file, reason });
    else valid.push(file);
  }

  const limit = options.maxFiles ?? valid.length;
  const accepted = valid.slice(0, Math.max(0, limit));

  for (const file of valid.slice(accepted.length)) {
    rejections.push({ file, reason: "count" });
  }

  return { accepted, rejections };
};
