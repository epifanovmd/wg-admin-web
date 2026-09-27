import { localPoint } from "@visx/event";
import { useTooltip } from "@visx/tooltip";
import type { KeyboardEvent, MouseEvent, TouchEvent } from "react";
import { useCallback } from "react";

import { nearestIndex } from "../utils/scales";

export interface UseChartTooltipOptions {
  /** Пиксельная позиция каждой точки по X внутри области графика. */
  positions: number[];
  /** Смещение области графика от левого края svg. */
  originX: number;
  /** Верхняя точка среди серий на позиции — к ней крепится блок значений. */
  topOf: (index: number) => number;
  onSelect?: (index: number) => void;
}

export interface ChartActivePoint {
  index: number;
  left: number;
  top: number;
}

export interface UseChartTooltipResult {
  active: ChartActivePoint | null;
  handlePointer: (
    event: MouseEvent<SVGElement> | TouchEvent<SVGElement>,
  ) => void;
  handleKeyDown: (event: KeyboardEvent<SVGElement>) => void;
  handleFocus: () => void;
  handleClick: () => void;
  hide: () => void;
}

type PointerLikeEvent = MouseEvent<SVGElement> | TouchEvent<SVGElement>;

/**
 * Тултип снапится к ближайшей позиции данных: читатель целится в дату,
 * а не в двухпиксельную линию. С клавиатуры — те же позиции стрелками.
 */
export const useChartTooltip = ({
  positions,
  originX,
  topOf,
  onSelect,
}: UseChartTooltipOptions): UseChartTooltipResult => {
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<number>();

  const show = useCallback(
    (index: number) =>
      showTooltip({
        tooltipData: index,
        tooltipLeft: positions[index],
        tooltipTop: topOf(index),
      }),
    [positions, showTooltip, topOf],
  );

  const handlePointer = useCallback(
    (event: PointerLikeEvent) => {
      const point = localPoint(event);
      const index = point ? nearestIndex(positions, point.x - originX) : null;

      if (index !== null) {
        show(index);
      }
    },
    [originX, positions, show],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<SVGElement>) => {
      const last = positions.length - 1;
      const current = tooltipData ?? 0;

      const next: Record<string, number | null> = {
        ArrowLeft: Math.max(0, current - 1),
        ArrowRight: Math.min(last, current + 1),
        Home: 0,
        End: last,
        Escape: null,
      };

      if (!(event.key in next)) {
        return;
      }

      event.preventDefault();

      const index = next[event.key];

      if (index === null) {
        hideTooltip();
      } else {
        show(index);
      }
    },
    [hideTooltip, positions.length, show, tooltipData],
  );

  const handleFocus = useCallback(
    () => show(tooltipData ?? 0),
    [show, tooltipData],
  );

  const handleClick = useCallback(() => {
    if (tooltipData !== undefined) {
      onSelect?.(tooltipData);
    }
  }, [onSelect, tooltipData]);

  const active =
    tooltipData === undefined ||
    tooltipLeft === undefined ||
    tooltipTop === undefined
      ? null
      : { index: tooltipData, left: tooltipLeft, top: tooltipTop };

  return {
    active,
    handlePointer,
    handleKeyDown,
    handleFocus,
    handleClick,
    hide: hideTooltip,
  };
};
