import type { WgPeerDto } from "./wgPeerDto.ts";

/**
 * Страница по смещению: списки с известным общим числом.
 */
export interface IPaginatedDtoWgPeerDto {
  items: WgPeerDto[];
  /** Всего элементов, подходящих под фильтр. */
  total: number;
  offset: number;
  limit: number;
}
