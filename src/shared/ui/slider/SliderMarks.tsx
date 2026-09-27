import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  getMarkPosition,
  getStartEdge,
  type SliderMark,
} from "./slider-helpers";
import {
  SLIDER_THUMB_SIZE_PX,
  type SliderOrientation,
  type SliderSize,
} from "./slider-variants";

export interface SliderMarksProps {
  marks: SliderMark[];
  min: number;
  max: number;
  size: SliderSize;
  orientation: SliderOrientation;
  inverted: boolean;
}

const DOT_CLASS = "absolute size-1 rounded-full bg-muted-foreground/50";
const DOT_ORIENTATION_CLASS: Record<SliderOrientation, string> = {
  horizontal: "top-1/2 -translate-x-1/2 -translate-y-1/2",
  vertical: "left-1/2 -translate-x-1/2 translate-y-1/2",
};
const LABEL_CLASS = "absolute text-xs whitespace-nowrap text-muted-foreground";
const LABEL_ORIENTATION_CLASS: Record<SliderOrientation, string> = {
  horizontal: "top-full mt-1.5",
  vertical: "left-full ml-2 translate-y-1/2",
};
/** Крайние подписи горизонтальной шкалы прижаты к краям, чтобы не выходить за трек. */
const HORIZONTAL_LABEL_ALIGN = {
  start: "left-0",
  center: "-translate-x-1/2",
  end: "right-0",
} as const;

type LabelAlign = keyof typeof HORIZONTAL_LABEL_ALIGN;

const resolveLabelAlign = (
  value: number,
  min: number,
  max: number,
): LabelAlign => {
  if (value <= min) return "start";
  if (value >= max) return "end";

  return "center";
};

/** Метки шкалы под треком: точка на треке и необязательная подпись. */
export const SliderMarks = ({
  marks,
  min,
  max,
  size,
  orientation,
  inverted,
}: SliderMarksProps) => {
  const edge = getStartEdge(orientation);
  const thumbSize = SLIDER_THUMB_SIZE_PX[size];

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {marks.map(mark => {
        const style = {
          [edge]: getMarkPosition(mark.value, min, max, thumbSize, inverted),
        };
        const align =
          orientation === "horizontal" && !inverted
            ? resolveLabelAlign(mark.value, min, max)
            : "center";
        const isEdgeLabel = align !== "center";

        return (
          <React.Fragment key={mark.value}>
            <span
              className={cn(DOT_CLASS, DOT_ORIENTATION_CLASS[orientation])}
              style={style}
              data-slot="slider-mark"
            />
            {mark.label !== undefined && (
              <span
                className={cn(
                  LABEL_CLASS,
                  LABEL_ORIENTATION_CLASS[orientation],
                  orientation === "horizontal" && HORIZONTAL_LABEL_ALIGN[align],
                )}
                style={isEdgeLabel ? undefined : style}
                data-slot="slider-mark-label"
              >
                {mark.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};
