import { cn } from "@shared/lib/utils";

export type ChartLegendShape = "line" | "area";

export interface ChartLegendItemProps {
  label: string;
  color: string;
  shape: ChartLegendShape;
  hidden: boolean;
  onToggle?: () => void;
}

const MARK_CLASS_NAME: Record<ChartLegendShape, string> = {
  line: "h-0.5 w-3.5 rounded-full",
  area: "h-2.5 w-2.5 rounded-sm",
};

/** Метка повторяет марку: штрих для линии, плашка для области. */
export const ChartLegendItem = ({
  label,
  color,
  shape,
  hidden,
  onToggle,
}: ChartLegendItemProps) => {
  const className = cn(
    "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
    hidden && "opacity-40",
  );

  const content = (
    <>
      <span
        className={cn("shrink-0", MARK_CLASS_NAME[shape])}
        style={{ background: color }}
      />
      <span className="truncate">{label}</span>
    </>
  );

  if (!onToggle) {
    return <li className={className}>{content}</li>;
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!hidden}
        className={cn(className, "cursor-pointer hover:text-foreground")}
      >
        {content}
      </button>
    </li>
  );
};
