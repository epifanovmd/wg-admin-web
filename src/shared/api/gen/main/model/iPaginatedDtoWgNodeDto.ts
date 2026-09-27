import type { WgNodeDto } from "./wgNodeDto.ts";

/**
 * Страница по смещению: списки с известным общим числом.
 */
export interface IPaginatedDtoWgNodeDto {
  items: WgNodeDto[];
  /** Всего элементов, подходящих под фильтр. */
  total: number;
  offset: number;
  limit: number;
}
