const UNITS = ["Б", "КБ", "МБ", "ГБ", "ТБ"] as const;

const STEP = 1024;

const formatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

/** Размер файла по-русски: `512 Б`, `1,5 КБ`, `1,2 МБ`. */
export const formatFileSize = (bytes: number): string => {
  let value = Math.max(0, bytes);
  let unit = 0;

  while (value >= STEP && unit < UNITS.length - 1) {
    value /= STEP;
    unit += 1;
  }

  return `${formatter.format(value)} ${UNITS[unit]}`;
};
