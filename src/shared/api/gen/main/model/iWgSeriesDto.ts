import type { IWgSeriesPointDto } from "./iWgSeriesPointDto.ts";

/**
 * Серия статистики (одна на ключ группировки).
 */
export interface IWgSeriesDto {
  /** id ноды/интерфейса/пира или `total`. */
  key: string;
  points: IWgSeriesPointDto[];
}
