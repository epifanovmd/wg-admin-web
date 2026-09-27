import { cn } from "@shared/lib/utils";
import { FC, ReactNode } from "react";

import { WG_RX_COLOR, WG_TX_COLOR } from "../lib/colors";

interface WgRxTxProps {
  rx: ReactNode;
  tx: ReactNode;
  /** В строку («↓ … · ↑ …») — для подписей и ячеек; иначе — две строки. */
  inline?: boolean;
  className?: string;
}

/** Приём и отдача в цветах графика скорости. */
export const WgRxTx: FC<WgRxTxProps> = ({ rx, tx, inline, className }) => (
  <span
    className={cn(
      inline ? "inline-flex flex-wrap gap-x-2" : "flex flex-col",
      className,
    )}
  >
    <span style={{ color: WG_RX_COLOR }}>↓ {rx}</span>
    <span style={{ color: WG_TX_COLOR }}>↑ {tx}</span>
  </span>
);
