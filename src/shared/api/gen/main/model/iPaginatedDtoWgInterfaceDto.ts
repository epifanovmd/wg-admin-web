import type { WgInterfaceDto } from "./wgInterfaceDto.ts";

/**
 * Страница по смещению: списки с известным общим числом.
 */
export interface IPaginatedDtoWgInterfaceDto {
  items: WgInterfaceDto[];
  /** Всего элементов, подходящих под фильтр. */
  total: number;
  offset: number;
  limit: number;
}
