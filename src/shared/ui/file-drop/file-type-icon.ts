import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react";

const ARCHIVE_EXT = /\.(zip|rar|7z|tar|gz)$/i;
const SHEET_EXT = /\.(xlsx?|csv|ods)$/i;
const TEXT_EXT = /\.(pdf|docx?|txt|md|rtf|odt)$/i;

/** Иконка по MIME-типу, а без него — по расширению. */
export const getFileTypeIcon = (file: File): LucideIcon => {
  const { type, name } = file;

  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (ARCHIVE_EXT.test(name)) return FileArchive;
  if (SHEET_EXT.test(name)) return FileSpreadsheet;
  if (type.startsWith("text/") || TEXT_EXT.test(name)) return FileText;

  return FileIcon;
};

export const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/");
