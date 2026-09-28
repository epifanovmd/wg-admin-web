import { cn } from "@shared/lib/utils";
import { FC } from "react";

import type { IVersionLine } from "../model/versions";

interface AppVersionsProps {
  lines: IVersionLine[];
  className?: string;
}

/** Подпись версий веба, API и агента — мелким текстом внизу меню. */
export const AppVersions: FC<AppVersionsProps> = ({ lines, className }) => (
  <dl
    className={cn(
      "grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 px-2 py-1.5 text-[11px] text-muted-foreground",
      className,
    )}
  >
    {lines.map(line => (
      <div key={line.label} className="contents" title={line.hint}>
        <dt>{line.label}</dt>
        <dd className="truncate text-right font-mono">{line.value}</dd>
      </div>
    ))}
  </dl>
);
