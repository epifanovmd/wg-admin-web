import type { WgEndpointDto } from "./wgEndpointDto.ts";

/**
 * Страница по смещению: списки с известным общим числом.
 */
export interface IPaginatedDtoWgEndpointDto {
  items: WgEndpointDto[];
  /** Всего элементов, подходящих под фильтр. */
  total: number;
  offset: number;
  limit: number;
}
