import { cn } from "@shared/lib/utils";
import { FC, ReactNode } from "react";

import { AGENT_RX_COLOR, AGENT_TX_COLOR } from "../lib/colors";

interface AgentRxTxProps {
  rx: ReactNode;
  tx: ReactNode;
  /** В строку («↓ … ↑ …») — для подписей и ячеек; иначе — две строки. */
  inline?: boolean;
  className?: string;
}

/** Приём и отдача в цветах графика сети. */
export const AgentRxTx: FC<AgentRxTxProps> = ({
  rx,
  tx,
  inline,
  className,
}) => (
  <span
    className={cn(
      inline ? "inline-flex flex-wrap gap-x-2" : "flex flex-col",
      className,
    )}
  >
    <span style={{ color: AGENT_RX_COLOR }}>↓ {rx}</span>
    <span style={{ color: AGENT_TX_COLOR }}>↑ {tx}</span>
  </span>
);
